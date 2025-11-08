//controllers/reportesController.js
const pool = require('../config/db');

/**
 * Obtiene todos los reportes con información detallada del proyecto y responsable
 */
const getReportes = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.id_proyecto,
        p.nombre AS nombre_proyecto,
        r.fecha_creacion,
        r.avance,
        r.actividades,
        r.problemas_obs,
        r.proximos_pasos,
        r.responsable_id,
        u.nombre AS nombre_responsable,
        u.email AS email_responsable
      FROM reportes r
      JOIN proyectos p ON r.id_proyecto = p.id
      JOIN usuarios u ON r.responsable_id = u.id
      ORDER BY r.fecha_creacion DESC;
    `;

    const result = await pool.query(query);

    const reportes = result.rows.map(row => ({
      id: row.id,
      id_proyecto: row.id_proyecto,
      nombre_proyecto: row.nombre_proyecto,
      fecha_creacion: row.fecha_creacion,
      avance: row.avance,
      actividades: row.actividades,
      problemas_obs: row.problemas_obs,
      proximos_pasos: row.proximos_pasos,
      responsable_id: row.responsable_id,
      nombre_responsable: row.nombre_responsable,
      email_responsable: row.email_responsable
    }));

    res.json(reportes);

  } catch (error) {
    console.error('Error en getReportes:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener reportes',
      error: error.message 
    });
  }
};


module.exports = {
  getReportes,
};