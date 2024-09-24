const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Function to generate a JWT based on the provided user ID.
 * Uses a secret from the environment and sets a 10-hour expiration time.
 */
function jwtGenerator(user_id) {
  const payload = {
    user: {
      id: user_id
    }
  };

  // Generate and return the JWT
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10h" });
}

module.exports = jwtGenerator;
