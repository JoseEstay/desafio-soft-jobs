require("dotenv").config();
const jwt = require("jsonwebtoken");

// 1. Middleware para reportar por terminal las consultas recibidas en el servidor
const reportarConsultas = (req, res, next) => {
  const timestamp = new Date().toLocaleString();
  console.log(`[${timestamp}] Consulta recibida: ${req.method} ${req.originalUrl}`);
  next();
};

// 2. Middleware para verificar la existencia de credenciales en la ruta correspondiente (login o registro)
const verificarCredenciales = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Credenciales incompletas: email y password son requeridos",
    });
  }
  next();
};

// 3. Middleware para validar el token recibido en las cabeceras (GET /usuarios)
const validarToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({
      message: "No se proporcionó token en la cabecera Authorization",
    });
  }

  const [bearer, token] = authorizationHeader.split(" ");

  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Formato de autorización no válido. Debe ser: Bearer <token>",
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "az_AZ_2024_soft_jobs_secret_key";
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, secret);
    // Adjuntamos el payload decodificado (que contiene { email }) a req.user
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado",
    });
  }
};

module.exports = {
  reportarConsultas,
  verificarCredenciales,
  validarToken,
};

