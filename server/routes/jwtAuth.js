const express = require("express");
const router = express.Router();

/**
 * Route to register a new user using Firebase Authentication.
 */
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    res.status(201).json({ userId: userRecord.uid, email: userRecord.email });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

/**
 * Route to log in a user (Firebase handles authentication client-side).
 */
router.post("/login", async (req, res) => {
  res.status(200).json({ message: "Use Firebase client SDK for login." });
});

module.exports = router;
