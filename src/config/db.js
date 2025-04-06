const express = require('express');
const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

const app = express();
const port = 3000;

console.log('Variables de entorno cargadas:');
console.log('User:', process.env.POSTGRES_USER);
console.log('Password:', typeof process.env.POSTGRES_PASSWORD, process.env.POSTGRES_PASSWORD ? 'Existe' : 'No existe', process.env.POSTGRES_PASSWORD);
console.log('DB:', process.env.POSTGRES_DB);
console.log('Port:', process.env.PORT_DB);
console.log('Host:', process.env.DB_HOST);

// Pool de conexión a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,         // Cambia a 'postgres' si corres el backend en Docker
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: process.env.PORT_DB,
});

const qqq = "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema');"

// Ruta de prueba para verificar la conexión
app.get('/usuarios', async (req, res) => {
  try {
    const { rows } = await pool.query(qqq);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error.message);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});