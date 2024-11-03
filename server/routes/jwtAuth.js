const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // Changed from bcrypt to bcryptjs
const pool = require("../database_pg");
const validInfo = require("../middleware/validInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const authorize = require("../middleware/authorize");

/**
 * Ruta POST para el registro de usuarios.
 * Valida la información, verifica si el usuario ya existe y crea un nuevo usuario en la base de datos.
 * Devuelve un token JWT si el registro es exitoso.
 */
router.post("/register", validInfo, async (req, res) => {
  const { email, name, password } = req.body;

  try {
    // Check if the user already exists
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exists!");
    }

    // Generate a hash of the password before storing it
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // Insert new user into the database
    let newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, bcryptPassword]
    );

    // Generate a JWT for the new user
    const jwtToken = jwtGenerator(newUser.rows[0].user_id);

    // Respond with the JWT
    return res.json({ jwtToken });
  } catch (err) {
    console.error("Registration Error:", err); // More detail in logs
    res.status(500).send("Server error");
  }
});


/**
 * Ruta POST para iniciar sesión.
 * Valida la información, verifica las credenciales del usuario y devuelve un token JWT si la autenticación es exitosa.
 */
router.post("/login", validInfo, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credentials");
    }

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

    if (!validPassword) {
      return res.status(401).json("Invalid Credentials");
    }

    // Generar un token JWT para el usuario autenticado
    const jwtToken = jwtGenerator(user.rows[0].user_id);

    // Responder con el token JWT
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

/**
 * Ruta GET para verificar la autenticación del usuario.
 * Requiere autorización mediante el middleware "authorize".
 */
router.get("/verify", authorize, (req, res) => {
  try {
    // Responder con verdadero si la autenticación es exitosa
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
