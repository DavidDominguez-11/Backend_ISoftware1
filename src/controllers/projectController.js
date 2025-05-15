//controllers/projectController

const pool = require('../config/db');

// all proyexcts
const getProjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proyectos');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proyectos' });
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getProjects:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = {
  getProjects
};