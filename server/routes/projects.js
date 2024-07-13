// routes/projects.js
const router = require("express").Router();
const { v4: uuidv4 } = require('uuid'); // Import uuidv4 for generating unique IDs
const pool = require("../database_pg");
const authorize = require("../middleware/authorize");

// GET all projects for the authenticated user
router.get('/', authorize, async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await pool.query('SELECT * FROM projects WHERE user_id = $1', [userId]);
    res.json(projects.rows);
  } catch (error) {
    console.error('Error fetching projects', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authorize, async (req, res) => {
  try {
    const { project_name, budget } = req.body;
    const userId = req.user.id;
    const projectId = uuidv4(); // Generate a unique project ID
    const newProject = await pool.query('INSERT INTO projects (project_id, project_name, user_id, budget) VALUES ($1, $2, $3, $4) RETURNING *', [projectId, project_name, userId, budget]);
    res.status(201).json(newProject.rows[0]);
  } catch (error) {
    console.error('Error creating project', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new project for the authenticated user
router.post('/:projectId/pvsystems', authorize, async (req, res) => {
  const projectId = req.params.projectId;
  const { pvId, duration, peaksunhours, batterytype } = req.body;

  try {
      // Check if a PV system already exists for the project
      const existingPVSystem = await pool.query('SELECT * FROM pv_system WHERE project_id = $1', [projectId]);

      if (existingPVSystem.rows.length > 0) {
          // If a PV system exists, update it
          const updatedPVSystem = await pool.query(
              'UPDATE pv_system SET duration = $1, peaksunhours = $2, batterytype = $3 WHERE project_id = $4 RETURNING *',
              [duration, peaksunhours, batterytype, projectId]
          );
          res.status(200).json(updatedPVSystem.rows[0]);
      } else {
          // If no PV system exists, create a new one
          const newPVSystem = await pool.query(
              'INSERT INTO pv_system (project_id, pv_id, duration, peaksunhours, batterytype) VALUES ($1, $2, $3, $4, $5) RETURNING *',
              [projectId, pvId, duration, peaksunhours, batterytype]
          );
          res.status(201).json(newPVSystem.rows[0]);
      }
  } catch (error) {
      console.error('Error adding or updating PV system', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// DELETE project by ID for the authenticated user
router.delete("/:projectId", authorize, async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Delete calculations associated with the project
    await pool.query('DELETE FROM energy_storage_calculations WHERE project_id = $1', [projectId]);

    // Delete the project
    const deletedProject = await pool.query('DELETE FROM projects WHERE project_id = $1 RETURNING *', [projectId]);

    if (deletedProject.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project and associated calculations deleted successfully' });
  } catch (error) {
    console.error('Error deleting project and associated calculations', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const calculateVLE = (calculations) => {
  let CLE = 0;
  let ELE = 0;

  for (const calculation of calculations) {
      if (calculation.category === "CL") {
          CLE += calculation.power_consumption;
      } else if (calculation.category === "EL") {
          ELE += calculation.power_consumption;
      }
  }

  return CLE + ELE;
};

const calculateSLE = (calculations) => {
  let DLE = 0;
  let NELE = 0;

  for (const calculation of calculations) {
      if (calculation.category === "DL") {
          DLE += calculation.power_consumption;
      } else if (calculation.category === "NEL") {
          NELE += calculation.power_consumption;
      }
  }

  return DLE + NELE;
};

const calculateSTESSPI = (calculation, VLE) => {
  let power = calculation.power_consumption;
  if (calculation.power_consumption === 0 && calculation.ampere > 0 && calculation.volts > 0) {
      power = calculation.ampere * calculation.volts;
  }

  if (
      (calculation.max_critical_recovery_time > 0 && VLE > 0) &&
      (calculation.category === "CL" || calculation.category === "EL")
  ) {
      return (
          (power / VLE) *
          (calculation.complete_recovery_time / calculation.max_critical_recovery_time)
      );
  }
  return 0;
};

const calculateMTESSPI = (calculation, VLE, SLE) => {
  let power = calculation.power_consumption;
  if (calculation.power_consumption === 0 && calculation.ampere > 0 && calculation.volts > 0) {
      power = calculation.ampere * calculation.volts;
  }

  if (
      (calculation.max_critical_recovery_time > 0 && SLE > 0) &&
      (calculation.category === "DL" || calculation.category === "NEL")
  ) {
      return (
          (power / (VLE + SLE)) *
          (calculation.complete_recovery_time / calculation.max_critical_recovery_time)
      );
  }
  return 0;
};

/**
* Route to get energy storage system calculations for the authenticated user.
* Requires authorization using the "authorize" middleware.
*/
router.get("/:projectId/calculations", authorize, async (req, res) => {
  const projectId = req.params.projectId;

  try {
      // Fetch energy storage system calculations for the specified project
      const calculations = await pool.query(
          "SELECT * FROM energy_storage_calculations WHERE project_id = $1",
          [projectId]
      );

      // Respond with the calculations
      res.json(calculations.rows);
  } catch (err) {
      // Handle internal server errors
      console.error(err.message);
      res.status(500).send("Server error");
  }
});

router.put("/:projectId/calculations/:calculationId", authorize, async (req, res) => {
  const projectId = req.params.projectId;
  const calculationId = req.params.calculationId;

  const {
      max_critical_recovery_time,
      complete_recovery_time,
      power_consumption,
      name,
      category,
      stesspi,
      mtesspi,
      ampere,
      volts,
      quantity,
  } = req.body;

  try {
      // Check if the calculation exists for the specified project
      const calculation = await pool.query(
          "SELECT * FROM energy_storage_calculations WHERE calculation_id = $1 AND project_id = $2",
          [calculationId, projectId]
      );

      if (calculation.rows.length === 0) {
          return res.status(404).json({ message: "Calculation not found" });
      }

      // Update the calculation
      const updatedCalculation = await pool.query(
          "UPDATE energy_storage_calculations SET max_critical_recovery_time = $1, complete_recovery_time = $2, power_consumption = $3, name = $4, category = $5, stesspi = $6, mtesspi = $7, ampere = $8, volts = $9, quantity = $12, WHERE calculation_id = $10 AND project_id = $11 RETURNING *",
          [
              max_critical_recovery_time,
              complete_recovery_time,
              power_consumption,
              name,
              category,
              stesspi,
              mtesspi,
              ampere,
              volts,
              calculationId,
              projectId,
              quantity
          ]
      );

      // Respond with the updated calculation
      res.json(updatedCalculation.rows[0]);
  } catch (err) {
      // Handle internal server errors
      console.error(err.message);
      res.status(500).send("Server error");
  }
});



/**
* Route to add a new energy storage system calculation.
* Requires authorization using the "authorize" middleware.
*/
router.post("/:projectId/calculations", authorize, async (req, res) => {
  const projectId = req.params.projectId;
  const {
      max_critical_recovery_time,
      complete_recovery_time,
      power_consumption,
      name,
      category,
      ampere,
      volts,
      quantity
  } = req.body;

  // Convert empty strings to null for power_consumption, ampere, and volts
  const powerConsumptionValue = power_consumption !== '' ? parseFloat(power_consumption) : null;
  const ampereValue = ampere !== '' ? parseFloat(ampere) : null;
  const voltsValue = volts !== '' ? parseFloat(volts) : null;

  try {
      // Add the new calculation associated with the specified project
      const newCalculation = await pool.query(
          "INSERT INTO energy_storage_calculations (project_id, max_critical_recovery_time, complete_recovery_time, power_consumption, name, category, ampere, volts, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
          [
              projectId,
              max_critical_recovery_time,
              complete_recovery_time,
              powerConsumptionValue,
              name,
              category,
              ampereValue,
              voltsValue,
              quantity
          ]
      );

      // Fetch all calculations for the project
      const calculations = await pool.query(
          "SELECT * FROM energy_storage_calculations WHERE project_id = $1",
          [projectId]
      );

      // Recalculate stesspi and mtesspi for all calculations associated with the project
      for (const calculation of calculations.rows) {
          const VLE = calculateVLE(calculations.rows);
          const SLE = calculateSLE(calculations.rows);

          const newSTESSPI = calculateSTESSPI(calculation, VLE).toFixed(2);
          const newMTESSPI = calculateMTESSPI(calculation, VLE, SLE).toFixed(2);

          // Update the calculation with the new stesspi and mtesspi values
          await pool.query(
              "UPDATE energy_storage_calculations SET stesspi = $1, mtesspi = $2 WHERE calculation_id = $3",
              [newSTESSPI, newMTESSPI, calculation.calculation_id]
          );
      }

      // Respond with the newly added calculation
      res.json(newCalculation.rows[0]);
  } catch (err) {
      // Handle internal server errors
      console.error(err.message);
      res.status(500).send("Server error");
  }
});




router.delete("/:projectId/calculations/:calculationId", authorize, async (req, res) => {
  const projectId = req.params.projectId;
  const calculationId = req.params.calculationId;

  try {
      // Check if the calculation exists for the specified project
      const calculation = await pool.query(
          "SELECT * FROM energy_storage_calculations WHERE calculation_id = $1 AND project_id = $2",
          [calculationId, projectId]
      );

      if (calculation.rows.length === 0) {
          return res.status(404).json({ message: "Calculation not found" });
      }

      // Delete the energy storage system calculation associated with the specified project
      await pool.query("DELETE FROM energy_storage_calculations WHERE calculation_id = $1", [calculationId]);

      // Respond with success message
      res.json({ message: "Calculation deleted successfully" });
  } catch (err) {
      // Handle internal server errors
      console.error(err.message);
      res.status(500).send("Server error");
  }
});

router.get('/:projectId/pvsystems/:pvId', authorize, async (req, res) => {
  const projectId = req.params.projectId;
  const pvId = req.params.pvId;
  try {
    // Fetch PV system for the specified project and PV ID
    const pvSystem = await pool.query('SELECT * FROM pv_system WHERE project_id = $1 AND pv_id = $2', [projectId, pvId]);
    if (pvSystem.rows.length === 0) {
      return res.status(404).json({ error: 'PV system not found' });
    }
    res.json(pvSystem.rows[0]);
  } catch (error) {
    console.error('Error fetching PV system', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/:projectId/pvsystems', authorize, async (req, res) => {
  const projectId = req.params.projectId;
  const { pvId, duration, peaksunhours, batterytype } = req.body;

  try {
      // Insert the new PV system data
      const newPVSystem = await pool.query(
          'INSERT INTO pv_system (project_id, pv_id, duration, peaksunhours, batterytype) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [projectId, pvId, duration, peaksunhours, batterytype]
      );

      // Respond with the newly inserted PV system data
      res.status(201).json(newPVSystem.rows[0]);
  } catch (error) {
      console.error('Error adding a new PV system', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});




// DELETE PV system by ID for the authenticated user
router.delete("/:projectId/pvsystems/:pvId", authorize, async (req, res) => {
  const projectId = req.params.projectId;
  const pvId = req.params.pvId;
  try {
    // Delete the PV system associated with the specified project and PV ID
    const deletedPVSystem = await pool.query(
      'DELETE FROM pv_system WHERE pv_id = $1 AND project_id = $2 RETURNING *',
      [pvId, projectId]
    );
    if (deletedPVSystem.rows.length === 0) {
      return res.status(404).json({ error: 'PV system not found' });
    }
    res.json({ message: 'PV system deleted successfully' });
  } catch (error) {
    console.error('Error deleting PV system', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;