const pool = require('../config/db');

const getUsuarios = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM usuarios");
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al consultar la base de datos:', error.message);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
};

const createUsuario = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  if (!nombre || !email || !contraseña) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const query = `
      INSERT INTO usuarios (nombre, email, contraseña)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [nombre, email, contraseña];

    const { rows } = await pool.query(query, values);
    res.status(201).json({ message: 'Usuario creado', usuario: rows[0] });
  } catch (error) {
    console.error('Error al insertar en la base de datos:', error.message);
    res.status(500).json({ error: 'Error al insertar el usuario' });
  }
};

module.exports = {
  getUsuarios,
  createUsuario,
};