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

/**
 * Obtiene el número total de proyectos con estado 'finalizado'.
 */
const getFinishedProjectsCount = async (req, res) => {
  try {
    const query = "SELECT COUNT(*) FROM proyectos WHERE estado = 'finalizado'";
    const result = await pool.query(query);

    // El resultado de COUNT(*) es una cadena, lo convertimos a número.
    const count = parseInt(result.rows[0].count, 10);

    // Devolvemos el conteo en un objeto JSON.
    res.json({ total_finalizados: count });

  } catch (error) {
    console.error('Error en getFinishedProjectsCount:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const getInProgressProjects = async (req, res) => {
  try {
    const query = `
      SELECT 
          p.id,
          p.nombre AS proyecto,
          p.estado,
          p.presupuesto,
          p.fecha_inicio,
          p.fecha_fin,
          p.ubicacion,
          p.tipo_servicio,
          u.nombre AS cliente,
          u.email AS cliente_email
      FROM proyectos p
      JOIN usuarios u ON p.cliente_id = u.id
      WHERE p.estado = 'en progreso';
    `;
    const result = await pool.query(query);

    // Si no se encuentran proyectos en progreso, devuelve un 404.
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proyectos en progreso' });
    }

    res.json(result.rows);

  } catch (error) {
    console.error('Error en getInProgressProjects:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const getTotalProjectsByService = async (req, res) => {
  try {
    const query = `
      SELECT 
          tipo_servicio AS servicio,
          COUNT(*) AS proyectos
      FROM proyectos
      GROUP BY tipo_servicio
      ORDER BY proyectos DESC;
    `;
    const result = await pool.query(query);

    // Si no se encuentran proyectos en progreso, devuelve un 404.
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proyectos en progreso' });
    }

    res.json(result.rows);

  } catch (error) {
    console.error('Error en getTotlaProjectsByService:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};



module.exports = {
  getProjects,
  getFinishedProjects,
  getFinishedProjectsCount,
  getInProgressProjects,
  getTotalProjectsByService
};