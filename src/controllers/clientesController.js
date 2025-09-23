
// controllers/clientesController

const pool = require('../config/db');

// Obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron clientes' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { getClientes };
