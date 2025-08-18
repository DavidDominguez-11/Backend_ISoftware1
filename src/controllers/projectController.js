//controllers/projectController

const pool = require('../config/db');

// Obtiene todos los proyectos
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

/**
 * Obtiene la lista completa de proyectos con estado 'finalizado'.
 */
const getFinishedProjects = async (req, res) => {
  try {
    const query = "SELECT * FROM proyectos WHERE estado = 'finalizado'";
    const result = await pool.query(query);

    // Si no se encuentran proyectos finalizados, devuelve un 404.
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proyectos finalizados' });
    }

    // Devolvemos la lista de proyectos.
    res.json(result.rows);

  } catch (error) {
    console.error('Error en getFinishedProjects:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = {
  getProjects,
  getFinishedProjects // Exportamos la nueva función
};