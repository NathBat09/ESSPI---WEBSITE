// Ruta Protegida: Obtener Información del Usuario

const router = require("express").Router();
const authorize = require("../middleware/authorize");
const pool = require("../database_pg");

/**
 * Ruta POST protegida para obtener información del usuario autenticado.
 * Requiere autorización mediante el middleware "authorize".
 */
router.post("/", authorize, async (req, res) => {
  try {
    // Consulta para obtener el nombre de usuario del usuario autenticado
    const user = await pool.query(
      "SELECT user_name FROM users WHERE user_id = $1",
      [req.user.id]
    );

    // Responder con la información del usuario
    res.json(user.rows[0]);
  } catch (err) {
    // Manejar errores internos del servidor
    console.error(err.message);
    res.status(500).send("Error del servidor");
  }
});

module.exports = router;
