const pool = require('../config/db');

/**
 * Obtiene todos los proyectos con información resumida de reportes
 */
const getReportes = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        c.nombre AS cliente,
        MAX(r.fecha_creacion) AS ultimo_reporte,
        COUNT(r.id) AS total_reportes,
        MAX(r.avance) AS avance_actual,
        p.estado
      FROM proyectos p
      JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN reportes r ON p.id = r.id_proyecto
      GROUP BY p.id, c.id
      ORDER BY p.nombre;
    `;

    const result = await pool.query(query);

    const proyectosConReportes = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      cliente: row.cliente,
      ultimoReporte: row.ultimo_reporte ? new Date(row.ultimo_reporte).toISOString().split('T')[0] : null,
      totalReportes: parseInt(row.total_reportes) || 0,
      avanceActual: row.avance_actual || 0,
      estado: row.estado
    }));

    res.json(proyectosConReportes);

  } catch (error) {
    console.error('Error en getReportes:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener proyectos con reportes',
      error: error.message 
    });
  }
};

/**
 * Obtiene reportes de un proyecto específico con información detallada
 */
const getReportesPorProyecto = async (req, res) => {
  try {
    const { proyecto_id } = req.params;

    // Primero obtener información del proyecto
    const proyectoQuery = `
      SELECT 
        p.id,
        p.nombre,
        c.nombre AS cliente,
        MAX(r.avance) AS avance_actual
      FROM proyectos p
      JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN reportes r ON p.id = r.id_proyecto
      WHERE p.id = $1
      GROUP BY p.id, c.id;
    `;

    const proyectoResult = await pool.query(proyectoQuery, [proyecto_id]);

    if (proyectoResult.rows.length === 0) {
      return res.status(404).json({ 
        message: `Proyecto con ID ${proyecto_id} no encontrado` 
      });
    }

    const proyectoInfo = proyectoResult.rows[0];

    // Luego obtener los reportes del proyecto con fotos
    const reportesQuery = `
      SELECT 
        r.id,
        r.fecha_creacion,
        r.avance,
        r.actividades,
        r.problemas_obs,
        r.proximos_pasos,
        u.nombre AS responsable,
        json_agg(
          json_build_object(
            'id', rf.id,
            'url', rf.ruta_foto
          ) ORDER BY rf.id
        ) FILTER (WHERE rf.id IS NOT NULL) AS fotos
      FROM reportes r
      JOIN usuarios u ON r.responsable_id = u.id
      LEFT JOIN reportes_fotos rf ON r.id = rf.id_reporte
      WHERE r.id_proyecto = $1
      GROUP BY r.id, u.nombre
      ORDER BY r.fecha_creacion DESC;
    `;

    const reportesResult = await pool.query(reportesQuery, [proyecto_id]);

    const proyecto = {
      id: proyectoInfo.id,
      nombre: proyectoInfo.nombre,
      cliente: proyectoInfo.cliente,
      avanceActual: proyectoInfo.avance_actual || 0
    };

    const reportes = reportesResult.rows.map(row => ({
      id: row.id,
      fecha: new Date(row.fecha_creacion).toISOString().split('T')[0],
      avance: row.avance,
      actividadesCompletadas: row.actividades,
      problemas: row.problemas_obs,
      proximosPasos: row.proximos_pasos,
      responsable: row.responsable,
      fotos: row.fotos || []
    }));

    res.json({
      proyecto: proyecto,
      reportes: reportes
    });

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

/**
 * Obtiene la información completa de un reporte para generar PDF
 */
const getReporteParaPDF = async (req, res) => {
  try {
    const { reporte_id } = req.params;

    // Validar que el ID sea numérico
    if (isNaN(reporte_id) || !Number.isInteger(Number(reporte_id))) {
      return res.status(400).json({ 
        message: 'El ID del reporte debe ser un número entero válido' 
      });
    }

    const query = `
      SELECT 
        r.id,
        r.id_proyecto,
        p.nombre AS nombre_proyecto,
        p.estado AS estado_proyecto,
        p.presupuesto,
        p.fecha_inicio,
        p.fecha_fin,
        p.ubicacion,
        p.tipo_servicio,
        r.fecha_creacion,
        r.avance,
        r.actividades,
        r.problemas_obs,
        r.proximos_pasos,
        r.responsable_id,
        u.nombre AS nombre_responsable,
        u.email AS email_responsable,
        c.nombre AS nombre_cliente,
        c.telefono AS telefono_cliente,
        -- Obtener fotos del reporte si existen
        COALESCE(
          json_agg(
            json_build_object(
              'id', rf.id,
              'ruta_foto', rf.ruta_foto
            ) 
            ORDER BY rf.id
          ) FILTER (WHERE rf.id IS NOT NULL),
          '[]'
        ) AS fotos
      FROM reportes r
      JOIN proyectos p ON r.id_proyecto = p.id
      JOIN clientes c ON p.cliente_id = c.id
      JOIN usuarios u ON r.responsable_id = u.id
      LEFT JOIN reportes_fotos rf ON r.id = rf.id_reporte
      WHERE r.id = $1
      GROUP BY 
        r.id, p.id, u.id, c.id;
    `;

    const result = await pool.query(query, [reporte_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        message: `No se encontró un reporte con el ID ${reporte_id}` 
      });
    }

    const reporte = result.rows[0];

    // Estructurar la respuesta para el PDF
    const respuestaPDF = {
      id: reporte.id,
      proyecto: {
        id: reporte.id_proyecto,
        nombre: reporte.nombre_proyecto,
        estado: reporte.estado_proyecto,
        presupuesto: reporte.presupuesto,
        fecha_inicio: reporte.fecha_inicio,
        fecha_fin: reporte.fecha_fin,
        ubicacion: reporte.ubicacion,
        tipo_servicio: reporte.tipo_servicio
      },
      cliente: {
        nombre: reporte.nombre_cliente,
        telefono: reporte.telefono_cliente
      },
      reporte: {
        fecha_creacion: reporte.fecha_creacion,
        avance: reporte.avance,
        actividades: reporte.actividades,
        problemas_obs: reporte.problemas_obs,
        proximos_pasos: reporte.proximos_pasos
      },
      responsable: {
        id: reporte.responsable_id,
        nombre: reporte.nombre_responsable,
        email: reporte.email_responsable
      },
      fotos: reporte.fotos
    };

    res.json(respuestaPDF);

  } catch (error) {
    console.error('Error en getReporteParaPDF:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener datos para PDF',
      error: error.message 
    });
  }
};

/**
 * SUBIR FOTOS A UN REPORTE (URLs simples)
 * POST /reportes/{reporte_id}/fotos
 * Body: { fotos: ["url1", "url2", ...] }
 */
const subirFotosReporteSimple = async (req, res) => {
  try {
    const { reporte_id } = req.params;
    const { fotos } = req.body;

    // Validar que el reporte_id sea válido
    if (isNaN(reporte_id) || !Number.isInteger(Number(reporte_id))) {
      return res.status(400).json({
        message: 'El ID del reporte debe ser un número entero válido',
        received: reporte_id
      });
    }

    // Validar que se enviaron URLs de fotos
    if (!fotos || !Array.isArray(fotos) || fotos.length === 0) {
      return res.status(400).json({
        message: 'Debe proporcionar un array de URLs de fotos',
        ejemplo: { fotos: ["https://ejemplo.com/foto1.jpg", "https://ejemplo.com/foto2.jpg"] }
      });
    }

    // Validar que todas las URLs sean strings válidos
    for (let i = 0; i < fotos.length; i++) {
      const url = fotos[i];
      if (typeof url !== 'string' || url.trim() === '') {
        return res.status(400).json({
          message: `La foto en posición ${i + 1} debe ser una URL válida (string no vacío)`,
          received: url
        });
      }
    }

    // Verificar que el reporte existe usando raw SQL
    const reporteQuery = `
      SELECT 
        r.id,
        r.fecha_creacion,
        r.avance,
        p.nombre AS proyecto_nombre,
        p.estado AS proyecto_estado,
        u.nombre AS responsable_nombre,
        u.email AS responsable_email
      FROM reportes r
      JOIN proyectos p ON r.id_proyecto = p.id
      JOIN usuarios u ON r.responsable_id = u.id
      WHERE r.id = $1;
    `;

    const reporteResult = await pool.query(reporteQuery, [parseInt(reporte_id)]);

    if (reporteResult.rows.length === 0) {
      return res.status(404).json({
        message: `No se encontró un reporte con el ID ${reporte_id}`
      });
    }

    const reporte = reporteResult.rows[0];

    // Guardar cada URL en base de datos usando raw SQL
    const fotosGuardadas = [];
    
    for (const urlFoto of fotos) {
      const insertFotoQuery = `
        INSERT INTO reportes_fotos (id_reporte, ruta_foto)
        VALUES ($1, $2)
        RETURNING id, ruta_foto;
      `;

      const fotoResult = await pool.query(insertFotoQuery, [
        parseInt(reporte_id),
        urlFoto.trim()
      ]);

      const foto = fotoResult.rows[0];
      fotosGuardadas.push({
        id: foto.id,
        ruta_foto: foto.ruta_foto
      });
    }

    // Obtener total de fotos del reporte usando raw SQL
    const conteoQuery = `SELECT COUNT(*) as total FROM reportes_fotos WHERE id_reporte = $1;`;
    const conteoResult = await pool.query(conteoQuery, [parseInt(reporte_id)]);
    const totalFotos = parseInt(conteoResult.rows[0].total);

    res.status(201).json({
      message: `${fotosGuardadas.length} foto(s) añadida(s) exitosamente al reporte`,
      reporte: {
        id: reporte.id,
        proyecto: reporte.proyecto_nombre,
        estado_proyecto: reporte.proyecto_estado,
        responsable: reporte.responsable_nombre
      },
      fotos_guardadas: fotosGuardadas,
      total_fotos_reporte: totalFotos
    });

  } catch (error) {
    console.error('Error en subirFotosReporteSimple:', error);
    res.status(500).json({
      message: 'Error del servidor al guardar fotos del reporte',
      error: error.message
    });
  }
};

module.exports = {
  getReportes,
  getReportesPorProyecto,
  crearReporte,
  getReporteParaPDF,
  subirFotosReporteSimple
};