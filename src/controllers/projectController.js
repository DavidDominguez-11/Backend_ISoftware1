//controllers/projectController

const prisma = require('../prismaClient');

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
    const projects = await prisma.proyectos.findMany({ include: { cliente: true } });
    
    if (projects.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proyectos' });
    }
    
    res.json(projects);
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
    const projects = await prisma.proyectos.findMany({ 
      where: { estado: 'finalizado' },
      include: { cliente: true } 
    });

    // Si no se encuentran proyectos finalizados, devuelve un 404.
    if (projects.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proyectos finalizados' });
    }

    // Devolvemos la lista de proyectos.
    res.json(projects);

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
    const count = await prisma.proyectos.count({ where: { estado: 'finalizado' } });

    // Devolvemos el conteo en un objeto JSON.
    res.json({ total_finalizados: count });

  } catch (error) {
    console.error('Error en getFinishedProjectsCount:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const getInProgressProjects = async (req, res) => {
  try {
    const projects = await prisma.proyectos.findMany({ 
      where: { estado: 'en progreso' },
      include: { cliente: true } 
    });

    // Si no se encuentran proyectos en progreso, devuelve un 404.
    if (projects.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proyectos en progreso' });
    }

    res.json(projects);

  } catch (error) {
    console.error('Error en getInProgressProjects:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const getTotalProjectsByService = async (req, res) => {
  try {
    const projects = await prisma.proyectos.groupBy({
      by: ['tipo_servicio'],
      _count: {
        tipo_servicio: true,
      },
      orderBy: {
        _count: {
          tipo_servicio: 'desc',
        },
      },
    });

    // Si no se encuentran proyectos en progreso, devuelve un 404.
    if (projects.length === 0) {
      return res.status(404).json({ message: 'No se encontraron proyectos en progreso' });
    }

    res.json(projects);

  } catch (error) {
    console.error('Error en getTotlaProjectsByService:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const getInProgressProjectsCount = async (req, res) => {
  try {
    const count = await prisma.proyectos.count({ where: { estado: 'en progreso' } });

    res.json({ total: count });

  } catch (error) {
    console.error('Error en getInProgressProjectsCount:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

//post para crear PROYECTOS
const createProject = async (req, res) => {
  try {
    const { nombre, estado, presupuesto, cliente_id, fecha_inicio, fecha_fin, ubicacion, tipo_servicio } = req.body;
    const project = await prisma.proyectos.create({
      data: {
        nombre,
        estado,
        presupuesto,
        cliente_id,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        ubicacion,
        tipo_servicio
      }
    });
    res.status(201).json({
      message: 'Proyecto creado exitosamente',
      proyecto: project
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
      const project = await prisma.proyectos.update({
          where: { id: parseInt(id) },
          data: { tipo_servicio },
      });

      // 3. Verificar si el proyecto se encontró y se actualizó
      if (!project) {
          return res.status(404).json({ message: `No se encontró un proyecto con el ID ${id}.` });
      }

      // 4. Enviar el proyecto actualizado como respuesta
      res.status(200).json({
          message: 'El tipo de proyecto fue actualizado exitosamente.',
          proyecto: project
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
    const project = await prisma.proyectos.findUnique({ 
      where: { id: parseInt(id) },
      include: { cliente: true, proyecto_material: true } 
    });

    if (!project) {
      return res.status(404).json({ message: `No se encontró un proyecto con el ID ${id}.` });
    }

    res.json(project);

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
    const project = await prisma.proyectos.update({
      where: { id: parseInt(id) },
      data: { estado },
    });

    // Verificar si el proyecto se encontró y se actualizó
    if (!project) {
      return res.status(404).json({ 
        message: `No se encontró un proyecto con el ID ${id}.` 
      });
    }

    // Enviar el proyecto actualizado como respuesta
    res.status(200).json({
      message: 'Estado del proyecto actualizado exitosamente',
      proyecto: project
    });

  } catch (error) {
    console.error('Error en updateProjectStatus:', error);
    res.status(500).json({ 
      message: 'Error del servidor al actualizar el estado del proyecto',
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
  getProjectById,
  updateProjectStatus
};