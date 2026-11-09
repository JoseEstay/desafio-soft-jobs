require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const {
  registrarUsuario,
  verificarCredenciales: autenticarUsuario,
  obtenerUsuario,
} = require("./consultas");

const {
  reportarConsultas,
  verificarCredenciales,
  validarToken,
} = require("./middlewares");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(reportarConsultas); // Reportar por terminal las consultas recibidas

// 1. Ruta POST /usuarios - Registrar nuevos usuarios
app.post("/usuarios", async (req, res) => {
  try {
    const { email, password, rol, lenguage } = req.body;

    if (!email || !password || !rol || !lenguage) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios (email, password, rol, lenguage)",
      });
    }

    await registrarUsuario({ email, password, rol, lenguage });
    res.status(201).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    console.error("Error en POST /usuarios:", error);
    const status = (typeof error.code === "number" && error.code >= 100 && error.code < 600) ? error.code : 500;
    res.status(status).json({
      message: error.message || "Error al registrar el usuario",
    });
  }
});

// 2. Ruta POST /login - Iniciar sesión y devolver token JWT
app.post("/login", verificarCredenciales, async (req, res) => {
  try {
    const { email, password } = req.body;
    await autenticarUsuario(email, password);

    const secret = process.env.JWT_SECRET || "az_AZ_2024_soft_jobs_secret_key";
    // Firmar token incluyendo el email en el payload
    const token = jwt.sign({ email }, secret, { expiresIn: "2h" });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error en POST /login:", error);
    const status = (typeof error.code === "number" && error.code >= 100 && error.code < 600) ? error.code : 500;
    res.status(status).json({
      message: error.message || "Error al iniciar sesión",
    });
  }
});

// 3. Ruta GET /usuarios - Devolver datos del usuario autenticado
app.get("/usuarios", validarToken, async (req, res) => {
  try {
    const { email } = req.user;
    const usuario = await obtenerUsuario(email);
    res.status(200).json(usuario);
  } catch (error) {
    console.error("Error en GET /usuarios:", error);
    const status = (typeof error.code === "number" && error.code >= 100 && error.code < 600) ? error.code : 500;
    res.status(status).json({
      message: error.message || "Error al obtener datos del usuario",
    });
  }
});

// Manejador genérico para rutas inexistentes
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(` Servidor de Soft Jobs listo y conectado en http://localhost:${PORT}`);
});

module.exports = app;
