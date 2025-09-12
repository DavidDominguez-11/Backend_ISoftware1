//controllers/projectController

const pool = require('../config/db');

// Enum con los valores permitidos para tipo_servicio
const TIPO_SERVICIO_ENUM = [
  'regulares',
  'irregulares',
  'remodelaciones',
  'jacuzzis',
  'paneles solares',
  'fuentes y cascadas'
];

// Obtener todos los proyectos
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

const getInProgressProjectsCount = async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) AS total
      FROM proyectos
      WHERE estado = 'en progreso';
    `;

    const result = await pool.query(query);

    res.json({ total: parseInt(result.rows[0].total, 10) });

  } catch (error) {
    console.error('Error en getInProgressProjectsCount:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

//post para crear PROYECTOS
const createProject = async (req, res) => {
  try {
    const {
      nombre,
      estado,
      presupuesto,
      cliente_id,
      fecha_inicio,
      fecha_fin,
      ubicacion,
      tipo_servicio
    } = req.body;

    // Validaciones mínimas
    if (!nombre || !estado || !presupuesto || !cliente_id || !fecha_inicio || !tipo_servicio) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const query = `
      INSERT INTO proyectos 
        (nombre, estado, presupuesto, cliente_id, fecha_inicio, fecha_fin, ubicacion, tipo_servicio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      nombre,
      estado,
      presupuesto,
      cliente_id,
      fecha_inicio,
      fecha_fin || null,
      ubicacion || null,
      tipo_servicio
    ];

    const result = await pool.query(query, values);

    // Devolvemos el proyecto recién creado
    res.status(201).json({
      message: 'Proyecto creado exitosamente',
      proyecto: result.rows[0]
    });

  } catch (error) {
    console.error('Error en createProject:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar el tipo de servicio de un proyecto específico
const updateProjectType = async (req, res) => {
  const { id } = req.params;
  const { tipo_servicio } = req.body;

  // 1. Validar que el tipo_servicio fue enviado
  if (!tipo_servicio) {
      return res.status(400).json({ message: 'El campo tipo_servicio es requerido en el cuerpo de la solicitud.' });
  }

  // 2. Validar que el valor de tipo_servicio es uno de los permitidos por el ENUM
  if (!TIPO_SERVICIO_ENUM.includes(tipo_servicio)) {
      return res.status(400).json({ 
          message: 'Valor de tipo_servicio no válido.',
          valores_permitidos: TIPO_SERVICIO_ENUM 
      });
  }

  try {
      const query = `
          UPDATE proyectos 
          SET tipo_servicio = $1 
          WHERE id = $2 
          RETURNING *;
      `;
      const result = await pool.query(query, [tipo_servicio, id]);

      // 3. Verificar si el proyecto se encontró y se actualizó
      if (result.rowCount === 0) {
          return res.status(404).json({ message: `No se encontró un proyecto con el ID ${id}.` });
      }

      // 4. Enviar el proyecto actualizado como respuesta
      res.status(200).json({
          message: 'El tipo de proyecto fue actualizado exitosamente.',
          proyecto: result.rows[0]
      });

  } catch (error) {
      console.error('Error en updateProjectType:', error);
      res.status(500).json({ message: 'Error del servidor al actualizar el proyecto.' });
  }
};

const getProjectById = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    const query = 'SELECT * FROM proyectos WHERE id = $1';
    const result = await pool.query(query, [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `No se encontró un proyecto con el ID ${id}.` });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error en getProjectById:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el proyecto.' });
  }
};

// GET estado_proyectos
const getProjectStatuses = async (req, res) => {
  try {
    // Consulta para obtener los valores del ENUM estado_proyecto_enum
    const query = `
      SELECT unnest(enum_range(NULL::estado_proyecto_enum)) AS estado;
    `;
    
    const result = await pool.query(query);
    
    // Extraemos solo los valores del ENUM
    const estados = result.rows.map(row => row.estado);
    
    res.json({
      estados: estados,
      total: estados.length
    });
    
  } catch (error) {
    console.error('Error en getProjectStatuses:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener los estados de proyectos',
      error: error.message 
    });
  }
};

module.exports = {
  getProjects,
  getFinishedProjects,
  getFinishedProjectsCount,
  getInProgressProjects,
  getTotalProjectsByService,
  getInProgressProjectsCount,
  createProject,
  updateProjectType,
  getProjectStatuses, 
  getProjectById
};