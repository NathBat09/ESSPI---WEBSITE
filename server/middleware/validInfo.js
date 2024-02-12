// Middleware de Validación de Credenciales

/**
 * Este middleware valida las credenciales proporcionadas en las solicitudes de registro y inicio de sesión.
 * Verifica la presencia y validez del correo electrónico, nombre y contraseña según el contexto de la solicitud.
 * Devuelve mensajes de error si las credenciales son inválidas o faltan.
 */
module.exports = function(req, res, next) {
  const { email, name, password } = req.body;

  // Función para validar el formato del correo electrónico
  function validEmail(userEmail) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
  }

  // Validación de credenciales según el contexto de la solicitud
  if (req.path === "/register") {
    if (![email, name, password].every(Boolean)) {
      return res.json({ msg: "Missing Credentials" });
    } else if (!validEmail(email)) {
      return res.json({ msg: "Invalid Email" });
    }
  } else if (req.path === "/login") {
    if (![email, password].every(Boolean)) {
      return res.json({ msg: "Missing Credentials" });
    } else if (!validEmail(email)) {
      return res.json({ msg: "Invalid Email" });
    }
  }

  // Pasar al siguiente middleware si las credenciales son válidas
  next();
};
