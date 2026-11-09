require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "softjobs",
  port: process.env.DB_PORT || 5432,
  allowExitOnIdle: true,
});

// Registrar nuevo usuario con contraseña encriptada
const registrarUsuario = async ({ email, password, rol, lenguage }) => {
  const passwordEncriptada = await bcrypt.hash(password, 10);
  const consulta =
    "INSERT INTO usuarios (email, password, rol, lenguage) VALUES ($1, $2, $3, $4) RETURNING id, email, rol, lenguage;";
  const valores = [email, passwordEncriptada, rol, lenguage];

  try {
    const { rows } = await pool.query(consulta, valores);
    return rows[0];
  } catch (error) {
    if (error.code === "23505") {
      throw { code: 400, message: "El correo electrónico ya se encuentra registrado" };
    }
    throw error;
  }
};

// Verificar credenciales de login
const verificarCredenciales = async (email, password) => {
  const consulta = "SELECT * FROM usuarios WHERE email = $1;";
  const { rows, rowCount } = await pool.query(consulta, [email]);

  if (!rowCount) {
    throw { code: 404, message: "No se encontró ningún usuario con ese email" };
  }

  const usuario = rows[0];
  const passwordEsCorrecta = await bcrypt.compare(password, usuario.password);

  if (!passwordEsCorrecta) {
    throw { code: 401, message: "Email o contraseña incorrecta" };
  }

  return usuario;
};

// Obtener datos del usuario autenticado
// Se retorna el arreglo rows para que el frontend pueda hacer destructuring: const { data: [user] } = ...
const obtenerUsuario = async (email) => {
  const consulta = "SELECT id, email, rol, lenguage FROM usuarios WHERE email = $1;";
  const { rows, rowCount } = await pool.query(consulta, [email]);

  if (!rowCount) {
    throw { code: 404, message: "Usuario no encontrado" };
  }

  return rows;
};

module.exports = {
  pool,
  registrarUsuario,
  verificarCredenciales,
  obtenerUsuario,
};
