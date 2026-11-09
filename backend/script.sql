-- Creación de la base de datos
CREATE DATABASE softjobs;

-- Conectarse a la base de datos softjobs
\c softjobs;

-- Creación de la tabla usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(60) NOT NULL,
  rol VARCHAR(25),
  lenguage VARCHAR(20)
);

-- Consultar usuarios
SELECT * FROM usuarios;
