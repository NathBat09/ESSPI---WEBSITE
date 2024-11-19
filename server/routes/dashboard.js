const express = require("express");
const router = express.Router();

/**
 * Get user details for the authenticated user.
 */
router.get("/", async (req, res) => {
  const userId = req.query.userId; // Ensure `userId` is passed as a query param.

  try {
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userDoc.data());
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
