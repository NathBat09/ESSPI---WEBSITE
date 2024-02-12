const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Función para generar un token JWT basado en el ID de usuario proporcionado.
 * Utiliza un secreto y establece un tiempo de expiración de 1 hora.
 */
function jwtGenerator(user_id) {
  const payload = {
    user: {
      id: user_id
    }
  };

  // Generar y devolver el token JWT
  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "1h" });
}

module.exports = jwtGenerator;
