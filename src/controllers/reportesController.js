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

/**
 * Obtiene reportes de un proyecto específico
 */
const getReportesPorProyecto = async (req, res) => {
  try {
    const { proyecto_id } = req.params;

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
      WHERE r.id_proyecto = $1
      ORDER BY r.fecha_creacion DESC;
    `;

    const result = await pool.query(query, [proyecto_id]);

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
    console.error('Error en getReportesPorProyecto:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener reportes del proyecto',
      error: error.message 
    });
  }
};

/**
 * Crea un nuevo reporte para un proyecto
 */
const crearReporte = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id_proyecto, avance, actividades, problemas_obs, proximos_pasos, responsable_id } = req.body;

    // Validar que el proyecto exista
    const proyectoQuery = 'SELECT id FROM proyectos WHERE id = $1';
    const proyectoResult = await client.query(proyectoQuery, [id_proyecto]);
    
    if (proyectoResult.rows.length === 0) {
      return res.status(404).json({ 
        message: `Proyecto con ID ${id_proyecto} no encontrado` 
      });
    }

    // Validar que el usuario exista
    const usuarioQuery = 'SELECT id FROM usuarios WHERE id = $1';
    const usuarioResult = await client.query(usuarioQuery, [responsable_id]);
    
    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ 
        message: `Usuario con ID ${responsable_id} no encontrado` 
      });
    }

    // Validar avance
    if (avance < 0 || avance > 100) {
      return res.status(400).json({ 
        message: 'El avance debe estar entre 0 y 100' 
      });
    }

    // Validar campos requeridos
    if (!actividades || actividades.trim() === '') {
      return res.status(400).json({ 
        message: 'Las actividades son requeridas' 
      });
    }

    if (!proximos_pasos || proximos_pasos.trim() === '') {
      return res.status(400).json({ 
        message: 'Los próximos pasos son requeridos' 
      });
    }

    // Insertar el nuevo reporte
    const insertQuery = `
      INSERT INTO reportes (id_proyecto, avance, actividades, problemas_obs, proximos_pasos, responsable_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await client.query(insertQuery, [
      id_proyecto,
      avance,
      actividades,
      problemas_obs || '',
      proximos_pasos,
      responsable_id
    ]);

    await client.query('COMMIT');

    const nuevoReporte = result.rows[0];
    
    res.status(201).json({
      message: 'Reporte creado exitosamente',
      data: {
        id: nuevoReporte.id,
        id_proyecto: nuevoReporte.id_proyecto,
        fecha_creacion: nuevoReporte.fecha_creacion,
        avance: nuevoReporte.avance,
        actividades: nuevoReporte.actividades,
        problemas_obs: nuevoReporte.problemas_obs,
        proximos_pasos: nuevoReporte.proximos_pasos,
        responsable_id: nuevoReporte.responsable_id
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en crearReporte:', error);
    res.status(500).json({ 
      message: 'Error del servidor al crear reporte',
      error: error.message 
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getReportes,
  getReportesPorProyecto,
  crearReporte
};