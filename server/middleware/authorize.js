const admin = require("firebase-admin");

/**
 * Middleware to authenticate Firebase users using Firebase ID tokens.
 */
module.exports = async (req, res, next) => {
  const idToken = req.header("Authorization")?.split("Bearer ")[1];

  if (!idToken) {
    return res.status(403).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach decoded user info to the request object.
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};
