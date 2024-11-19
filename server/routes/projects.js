const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

/**
 * Helper functions for calculations (similar to your original logic).
 */
const calculateVLE = (calculations) => {
  let CLE = 0, ELE = 0;
  for (const calculation of calculations) {
    if (calculation.category === "CL") CLE += calculation.power_consumption;
    else if (calculation.category === "EL") ELE += calculation.power_consumption;
  }
  return CLE + ELE;
};

const calculateSLE = (calculations) => {
  let DLE = 0, NELE = 0;
  for (const calculation of calculations) {
    if (calculation.category === "DL") DLE += calculation.power_consumption;
    else if (calculation.category === "NEL") NELE += calculation.power_consumption;
  }
  return DLE + NELE;
};

const calculateSTESSPI = (calculation, VLE) => {
  if (calculation.max_critical_recovery_time > 0 && VLE > 0) {
    return (
      (calculation.power_consumption / VLE) *
      (calculation.complete_recovery_time / calculation.max_critical_recovery_time)
    );
  }
  return 0;
};

const calculateMTESSPI = (calculation, VLE, SLE) => {
  if (calculation.max_critical_recovery_time > 0 && (VLE + SLE) > 0) {
    return (
      (calculation.power_consumption / (VLE + SLE)) *
      (calculation.complete_recovery_time / calculation.max_critical_recovery_time)
    );
  }
  return 0;
};

/**
 * GET all projects for a user.
 */
router.get("/", async (req, res) => {
  const userId = req.query.userId;

  try {
    const projectsSnapshot = await db.collection("projects").where("userId", "==", userId).get();
    const projects = projectsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST create a new project.
 */
router.post("/", async (req, res) => {
  const { projectName, budget, userId } = req.body;

  try {
    const newProject = {
      projectName,
      budget,
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const projectRef = await db.collection("projects").add(newProject);
    res.status(201).json({ id: projectRef.id, ...newProject });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET calculations for a project.
 */
router.get("/:projectId/calculations", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    const calculationsSnapshot = await db
      .collection("energy_storage_calculations")
      .where("projectId", "==", projectId)
      .get();

    const calculations = calculationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(calculations);
  } catch (error) {
    console.error("Error fetching calculations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST add a new calculation to a project.
 */
router.post("/:projectId/calculations", async (req, res) => {
  const projectId = req.params.projectId;
  const {
    max_critical_recovery_time,
    complete_recovery_time,
    power_consumption,
    name,
    category,
    ampere,
    volts,
    quantity,
  } = req.body;

  try {
    const newCalculation = {
      projectId,
      max_critical_recovery_time,
      complete_recovery_time,
      power_consumption: power_consumption || ampere * volts,
      name,
      category,
      ampere,
      volts,
      quantity,
    };

    const calculationRef = await db.collection("energy_storage_calculations").add(newCalculation);

    // Update STESSPI and MTESSPI for all calculations
    const calculationsSnapshot = await db
      .collection("energy_storage_calculations")
      .where("projectId", "==", projectId)
      .get();

    const calculations = calculationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const VLE = calculateVLE(calculations);
    const SLE = calculateSLE(calculations);

    for (const calculation of calculations) {
      const updatedCalculation = {
        ...calculation,
        stesspi: calculateSTESSPI(calculation, VLE),
        mtesspi: calculateMTESSPI(calculation, VLE, SLE),
      };

      await db.collection("energy_storage_calculations").doc(calculation.id).set(updatedCalculation);
    }

    res.status(201).json({ id: calculationRef.id, ...newCalculation });
  } catch (error) {
    console.error("Error adding calculation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE a calculation.
 */
router.delete("/:projectId/calculations/:calculationId", async (req, res) => {
  const { projectId, calculationId } = req.params;

  try {
    await db.collection("energy_storage_calculations").doc(calculationId).delete();
    res.json({ message: "Calculation deleted successfully" });
  } catch (error) {
    console.error("Error deleting calculation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE a project and its calculations.
 */
router.delete("/:projectId", async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Delete calculations associated with the project
    const calculationsSnapshot = await db
      .collection("energy_storage_calculations")
      .where("projectId", "==", projectId)
      .get();

    const batch = db.batch();
    calculationsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    // Delete the project itself
    await db.collection("projects").doc(projectId).delete();

    res.json({ message: "Project and associated calculations deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
