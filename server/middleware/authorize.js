// Middleware de Autenticación con Token JWT

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Cargar variables de entorno desde un archivo .env
dotenv.config();

/**
 * Este middleware verifica si hay un token JWT en la cabecera de la solicitud.
 * Si el token es válido, agrega la información del usuario a req.user y pasa al siguiente middleware.
 * Si el token no está presente o no es válido, devuelve un mensaje de error.
 */
module.exports = function(req, res, next) {
  // Obtener el token de la cabecera de la solicitud
  const token = req.header("jwt_token");

  // Verificar la presencia del token
  if (!token) {
    return res.status(403).json({ msg: "¡No tienes permisos! Token no encontrado." });
  }

  // Verificar la validez del token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Agregar la información del usuario al objeto de solicitud
    req.user = decoded.user;

    // Pasar al siguiente middleware
    next();
  } catch (err) {
    // Manejar errores de token no válidos
    res.status(401).json({ msg: "¡Token inválido! Autenticación fallida." });
  }
};
