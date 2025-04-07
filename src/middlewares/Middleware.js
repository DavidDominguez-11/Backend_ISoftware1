const pool = require('../config/db');

exports.getTables = async (req, res) => {
  try {
    const query = "SELECT table_schema, table_name FROM information_schema.tables WHERE table_type = 'BASE TABLE' AND table_schema NOT IN ('pg_catalog', 'information_schema')";
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error.message);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
};