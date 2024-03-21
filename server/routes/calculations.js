const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../database_pg");

/**
 * Route to get energy storage system calculations for the authenticated user.
 * Requires authorization using the "authorize" middleware.
 */
router.get("/calculations", authorize, async (req, res) => {
    try {
        // Fetch energy storage system calculations for the authenticated user
        const calculations = await pool.query(
            "SELECT * FROM energy_storage_calculations WHERE user_id = $1",
            [req.user.id]
        );

        // Respond with the calculations
        res.json(calculations.rows);
    } catch (err) {
        // Handle internal server errors
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.put("/calculations/:id", authorize, async (req, res) => {
  const calculationId = req.params.id;

  const {
      max_critical_recovery_time,
      complete_recovery_time,
      power_consumption,
      name,
      category,
      stesspi,
      mtesspi,
      ampere,
      volts
  } = req.body;

  try {
      // Check if the calculation exists
      const calculation = await pool.query(
          "SELECT * FROM energy_storage_calculations WHERE calculation_id = $1",
          [calculationId]
      );

      if (calculation.rows.length === 0) {
          return res.status(404).json({ message: "Calculation not found" });
      }

      // Update the calculation
      const updatedCalculation = await pool.query(
          "UPDATE energy_storage_calculations SET max_critical_recovery_time = $1, complete_recovery_time = $2, power_consumption = $3, name = $4, category = $5, stesspi = $6, mtesspi = $7, ampere = $8, volts = $9 WHERE calculation_id = $10 RETURNING *",
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
              calculationId
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
router.post("/calculations", authorize, async (req, res) => {
    const {
        max_critical_recovery_time,
        complete_recovery_time,
        power_consumption,
        name,
        category,
        ampere,
        volts
    } = req.body;

    // Convert empty strings to null for power_consumption, ampere, and volts
    const powerConsumptionValue = power_consumption !== '' ? parseFloat(power_consumption) : null;
    const ampereValue = ampere !== '' ? parseFloat(ampere) : null;
    const voltsValue = volts !== '' ? parseFloat(volts) : null;

    try {
        // Add the new calculation
        const newCalculation = await pool.query(
            "INSERT INTO energy_storage_calculations (user_id, max_critical_recovery_time, complete_recovery_time, power_consumption, name, category, ampere, volts) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [
                req.user.id,
                max_critical_recovery_time,
                complete_recovery_time,
                powerConsumptionValue,
                name,
                category,
                ampereValue,
                voltsValue
            ]
        );

        // Fetch all calculations for the user
        const calculations = await pool.query(
            "SELECT * FROM energy_storage_calculations WHERE user_id = $1",
            [req.user.id]
        );

        // Recalculate stesspi and mtesspi for all calculations
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



router.delete("/calculations/:id", authorize, async (req, res) => {
    const calculationId = req.params.id;

    try {
        // Delete the energy storage system calculation
        await pool.query("DELETE FROM energy_storage_calculations WHERE calculation_id = $1", [calculationId]);

        // Respond with success message
        res.json({ message: "Calculation deleted successfully" });
    } catch (err) {
        // Handle internal server errors
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;

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
