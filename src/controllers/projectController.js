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

// PATCH para proyecto/id/estado PATCH para actualizar el estado de un proyecto 
const updateProjectStatus = async (req, res) => {
  const ESTADO_PROYECTO_ENUM = [
    'solicitado',
    'en progreso', 
    'finalizado',
    'cancelado'
  ];
  const { id } = req.params;
  const { estado } = req.body;

  // Validar que el ID sea un número
  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  // Validar que el estado fue enviado
  if (!estado) {
    return res.status(400).json({ 
      message: 'El campo "estado" es requerido' 
    });
  }

  // Validar que el estado sea uno de los permitidos
  if (!ESTADO_PROYECTO_ENUM.includes(estado)) {
    return res.status(400).json({ 
      message: 'Valor de estado no válido',
      valores_permitidos: ESTADO_PROYECTO_ENUM 
    });
  }

  try {
    const query = `
      UPDATE proyectos 
      SET estado = $1 
      WHERE id = $2 
      RETURNING *;
    `;
    
    const result = await pool.query(query, [estado, parseInt(id)]);

    // Verificar si el proyecto se encontró y se actualizó
    if (result.rowCount === 0) {
      return res.status(404).json({ 
        message: `No se encontró un proyecto con el ID ${id}.` 
      });
    }

    // Enviar el proyecto actualizado como respuesta
    res.status(200).json({
      message: 'Estado del proyecto actualizado exitosamente',
      proyecto: result.rows[0]
    });

  } catch (error) {
    console.error('Error en updateProjectStatus:', error);
    res.status(500).json({ 
      message: 'Error del servidor al actualizar el estado del proyecto',
      error: error.message 
    });
  }
};

// PUT actualizar proyecto por ID (actualización parcial de campos permitidos)
const updateProjectById = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

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

  // Verificar que al menos un campo se haya proporcionado
  if (
    nombre === undefined &&
    estado === undefined &&
    presupuesto === undefined &&
    cliente_id === undefined &&
    fecha_inicio === undefined &&
    fecha_fin === undefined &&
    ubicacion === undefined &&
    tipo_servicio === undefined
  ) {
    return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
  }

  // Validaciones específicas
  const ESTADO_PROYECTO_ENUM = [
    'solicitado',
    'en progreso',
    'finalizado',
    'cancelado'
  ];

  if (estado !== undefined && !ESTADO_PROYECTO_ENUM.includes(estado)) {
    return res.status(400).json({
      message: 'Valor de estado no válido',
      valores_permitidos: ESTADO_PROYECTO_ENUM
    });
  }

  if (tipo_servicio !== undefined && !TIPO_SERVICIO_ENUM.includes(tipo_servicio)) {
    return res.status(400).json({
      message: 'Valor de tipo_servicio no válido',
      valores_permitidos: TIPO_SERVICIO_ENUM
    });
  }

  if (presupuesto !== undefined && (isNaN(presupuesto) || Number(presupuesto) < 0)) {
    return res.status(400).json({ message: 'El presupuesto debe ser un número mayor o igual a 0' });
  }

  try {
    // Validar existencia de cliente si se envía cliente_id
    if (cliente_id !== undefined) {
      if (isNaN(cliente_id) || !Number.isInteger(Number(cliente_id))) {
        return res.status(400).json({ message: 'El cliente_id debe ser un número entero válido' });
      }
      const checkCliente = await pool.query('SELECT 1 FROM clientes WHERE id = $1', [parseInt(cliente_id)]);
      if (checkCliente.rowCount === 0) {
        return res.status(400).json({ message: `El cliente_id ${cliente_id} no existe` });
      }
    }

    // Construcción dinámica del SET
    const fields = [];
    const values = [];
    let idx = 1;

    if (nombre !== undefined) { fields.push(`nombre = $${idx++}`); values.push(nombre); }
    if (estado !== undefined) { fields.push(`estado = $${idx++}`); values.push(estado); }
    if (presupuesto !== undefined) { fields.push(`presupuesto = $${idx++}`); values.push(presupuesto); }
    if (cliente_id !== undefined) { fields.push(`cliente_id = $${idx++}`); values.push(parseInt(cliente_id)); }
    if (fecha_inicio !== undefined) { fields.push(`fecha_inicio = $${idx++}`); values.push(fecha_inicio); }
    if (fecha_fin !== undefined) { fields.push(`fecha_fin = $${idx++}`); values.push(fecha_fin); }
    if (ubicacion !== undefined) { fields.push(`ubicacion = $${idx++}`); values.push(ubicacion); }
    if (tipo_servicio !== undefined) { fields.push(`tipo_servicio = $${idx++}`); values.push(tipo_servicio); }

    const query = `
      UPDATE proyectos
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;

    values.push(parseInt(id));

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No se encontró un proyecto con el ID ${id}.` });
    }

    return res.status(200).json({
      message: 'Proyecto actualizado exitosamente',
      proyecto: result.rows[0]
    });
  } catch (error) {
    console.error('Error en updateProjectById:', error);
    return res.status(500).json({ message: 'Error del servidor al actualizar el proyecto', error: error.message });
  }
};

/**
 * Obtiene una lista detallada de materiales para todos los proyectos
 * que se encuentran en estado 'solicitado' o 'en progreso'.
 */
const getProjectMaterials = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.nombre AS proyecto,
        m.codigo AS codigo,
        m.material AS material,
        pm.ofertada AS ofertado,
        pm.en_obra AS en_obra,
        GREATEST(0, pm.ofertada - pm.en_obra - pm.reservado) AS pendiente_compra,
        pm.reservado AS pendiente_entrega
      FROM 
        proyectos p
      JOIN 
        proyecto_material pm ON p.id = pm.id_proyecto
      JOIN 
        materiales m ON pm.id_material = m.id
      WHERE 
        p.estado IN ('solicitado', 'en progreso')
      ORDER BY 
        p.nombre, m.codigo;
    `;
    
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron materiales para proyectos activos.' });
    }

    res.json(result.rows);

  } catch (error) {
    console.error('Error en getProjectMaterials:', error);
    res.status(500).json({ message: 'Error del servidor al obtener los materiales del proyecto.' });
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
  getProjectById,
  updateProjectStatus,
  updateProjectById,
  getProjectMaterials
};