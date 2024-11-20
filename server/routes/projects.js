const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * Middleware to authenticate user via Firebase ID Token
 */
const authenticateUser = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).json({ error: "Missing or invalid Authorization header" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.auth = { uid: decodedToken.uid };
    next();
  } catch (error) {
    console.error("Error verifying ID token:", error.message);
    return res.status(403).json({ error: "Unauthorized" });
  }
};

/**
 * Helper functions for calculations
 */
const calculateVLE = (calculations) => {
  return calculations.reduce((acc, calc) => acc + (calc.category === "CL" || calc.category === "EL" ? calc.power_consumption : 0), 0);
};

const calculateSLE = (calculations) => {
  return calculations.reduce((acc, calc) => acc + (calc.category === "DL" || calc.category === "NEL" ? calc.power_consumption : 0), 0);
};

const calculateSTESSPI = (calculation, VLE) => {
  if (calculation.max_critical_recovery_time > 0 && VLE > 0) {
    return (calculation.power_consumption / VLE) * (calculation.complete_recovery_time / calculation.max_critical_recovery_time);
  }
  return 0;
};

const calculateMTESSPI = (calculation, VLE, SLE) => {
  if (calculation.max_critical_recovery_time > 0 && (VLE + SLE) > 0) {
    return (calculation.power_consumption / (VLE + SLE)) * (calculation.complete_recovery_time / calculation.max_critical_recovery_time);
  }
  return 0;
};

/**
 * GET all projects for a user
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const projectsSnapshot = await db.collection("projects").where("userId", "==", req.auth.uid).get();
    const projects = projectsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST create a new project
 */
router.post("/", authenticateUser, async (req, res) => {
  const { projectName, budget } = req.body;

  try {
    if (!projectName || !budget) return res.status(400).json({ error: "Missing required fields" });

    const newProject = {
      projectName,
      budget,
      userId: req.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const projectRef = await db.collection("projects").add(newProject);
    console.log("Project created successfully:", projectRef.id);

    res.status(201).json({ id: projectRef.id, ...newProject });
  } catch (error) {
    console.error("Error creating project:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST add a new calculation to a project
 */
router.post("/:projectId/calculations", authenticateUser, async (req, res) => {
  const { projectId } = req.params;
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
      projectUserId: req.auth.uid, // Attach the authenticated user's UID
      max_critical_recovery_time,
      complete_recovery_time,
      power_consumption: power_consumption || ampere * volts,
      name,
      category,
      ampere,
      volts,
      quantity,
    };

    const calculationRef = await db.collection("calculations").add(newCalculation);
    res.status(201).json({ id: calculationRef.id, ...newCalculation });
  } catch (error) {
    console.error("Error adding calculation:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * DELETE a project and its calculations
 */
router.delete("/:projectId", authenticateUser, async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Delete all calculations for the project
    const calculationsSnapshot = await db.collection("energy_storage_calculations").where("projectId", "==", projectId).get();
    const batch = db.batch();
    calculationsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    // Delete the project
    await db.collection("projects").doc(projectId).delete();

    res.json({ message: "Project and associated calculations deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
