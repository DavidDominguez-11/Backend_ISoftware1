//controllers/projectController

const pool = require('../config/db');

// Enum con los valores permitidos para tipo_servicio
const TIPO_SERVICIO_ENUM = [
  'Piscina Regular',
  'Piscina Irregular',
  'Remodelacion',
  'Jacuzzi',
  'Paneles Solares',
  'Fuentes y Cascadas'
];

const ESTADO_PROYECTO_ENUM = ['Solicitado','En Progreso','Finalizado','Cancelado']; 

// Obtener todos los proyectos
const getProjects = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*, 
        c.nombre AS nombre_cliente
      FROM proyectos p
      JOIN clientes c ON p.cliente_id = c.id
    `;

    const result = await pool.query(query);

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
    const query = "SELECT * FROM proyectos WHERE estado = 'Finalizado'";
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
    const query = "SELECT COUNT(*) FROM proyectos WHERE estado = 'Finalizado'";
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
      WHERE p.estado = 'En Progreso';
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
      WHERE estado = 'En Progreso';
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

// PATCH /projects/:id/estado  (ajusta el prefix si usas /services)
const updateProjectStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ message: 'El ID debe ser un número entero válido', received: id });
  }
  if (!estado) return res.status(400).json({ message: 'El campo "estado" es requerido' });
  if (!ESTADO_PROYECTO_ENUM.includes(estado)) {
    return res.status(400).json({ message: 'Valor de estado no válido', valores_permitidos: ESTADO_PROYECTO_ENUM, recibido: estado });
  }

  try {
    const query = `
      UPDATE proyectos
      SET estado    = $1::estado_proyecto_enum,
          fecha_fin = CASE
            WHEN $1::estado_proyecto_enum IN ('Finalizado','Cancelado') THEN COALESCE(fecha_fin, CURRENT_DATE)
            ELSE NULL
          END
      WHERE id = $2::int
      RETURNING *;
    `;
    const result = await pool.query(query, [estado, Number(id)]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No se encontró un proyecto con el ID ${id}.` });
    }

    return res.status(200).json({
      message: 'Estado del proyecto actualizado exitosamente',
      proyecto: result.rows[0],
    });
  } catch (error) {
    console.error('PG ERROR updateProjectStatus =>', {
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      message: error.message,
      stack: error.stack,
    });

    if (error.code === '23514') { // check_violation
      return res.status(400).json({
        message: 'Violación de restricción: fecha_fin debe existir si estado es Finalizado/Cancelado y ser NULL en otros estados.',
        constraint: error.constraint,
      });
    }
    if (error.code === '22P02') { // invalid_text_representation (enum inválido)
      return res.status(400).json({
        message: 'Valor inválido para estado (ENUM). Debe coincidir exactamente.',
        valores_permitidos: ESTADO_PROYECTO_ENUM,
        recibido: estado,
      });
    }

    return res.status(500).json({ message: 'Error del servidor al actualizar el estado del proyecto', code: error.code });
  }
};

// PUT actualizar proyecto por ID (actualización parcial de campos permitidos)
const updateProjectById = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ message: 'El ID debe ser un número entero válido', received: id });
  }

  const {
    nombre,
    estado,          // puede venir o no
    presupuesto,
    cliente_id,
    fecha_inicio,    // YYYY-MM-DD (opcional)
    fecha_fin,       // YYYY-MM-DD o null (opcional)
    ubicacion,
    tipo_servicio
  } = req.body;

  // Nada que actualizar
  if ([nombre, estado, presupuesto, cliente_id, fecha_inicio, fecha_fin, ubicacion, tipo_servicio]
      .every(v => v === undefined)) {
    return res.status(400).json({ message: 'No se proporcionaron campos para actualizar' });
  }

  // Validaciones ligeras
  if (estado !== undefined && !ESTADO_PROYECTO_ENUM.includes(estado)) {
    return res.status(400).json({ message: 'Valor de estado no válido', valores_permitidos: ESTADO_PROYECTO_ENUM, recibido: estado });
  }
  if (tipo_servicio !== undefined && !TIPO_SERVICIO_ENUM.includes(tipo_servicio)) {
    return res.status(400).json({ message: 'Valor de tipo_servicio no válido', valores_permitidos: TIPO_SERVICIO_ENUM, recibido: tipo_servicio });
  }
  if (presupuesto !== undefined && (isNaN(presupuesto) || Number(presupuesto) < 0)) {
    return res.status(400).json({ message: 'El presupuesto debe ser un número mayor o igual a 0' });
  }
  if (cliente_id !== undefined && (isNaN(cliente_id) || !Number.isInteger(Number(cliente_id)))) {
    return res.status(400).json({ message: 'El cliente_id debe ser un número entero válido', recibido: cliente_id });
  }

  try {
    if (cliente_id !== undefined) {
      const checkCliente = await pool.query('SELECT 1 FROM clientes WHERE id = $1', [Number(cliente_id)]);
      if (checkCliente.rowCount === 0) {
        return res.status(400).json({ message: `El cliente_id ${cliente_id} no existe` });
      }
    }

    // 1) Siempre actualizamos estado y fecha_fin juntos con lógica segura
    const sets = [
      // nuevo_estado: si no se envía estado, conserva el actual
      `estado = COALESCE($1, estado)::estado_proyecto_enum`,
      // fecha_fin depende del nuevo_estado; si final/cancelado: usa fecha_fin enviada, o la existente, o CURRENT_DATE
      `fecha_fin = CASE
         WHEN COALESCE($1, estado)::estado_proyecto_enum IN ('Finalizado','Cancelado')
           THEN COALESCE($2::date, fecha_fin, CURRENT_DATE)
         ELSE NULL
       END`
    ];
    const vals = [ estado ?? null, fecha_fin ?? null ];
    let idx = 3;

    // 2) Campos opcionales adicionales
    if (nombre !== undefined)        { sets.push(`nombre = $${idx}`);                     vals.push(nombre); idx++; }
    if (presupuesto !== undefined)   { sets.push(`presupuesto = $${idx}`);                vals.push(Number(presupuesto)); idx++; }
    if (cliente_id !== undefined)    { sets.push(`cliente_id = $${idx}`);                 vals.push(Number(cliente_id)); idx++; }
    if (fecha_inicio !== undefined)  { sets.push(`fecha_inicio = $${idx}::date`);         vals.push(fecha_inicio); idx++; }
    if (ubicacion !== undefined)     { sets.push(`ubicacion = $${idx}`);                  vals.push(ubicacion); idx++; }
    if (tipo_servicio !== undefined) { sets.push(`tipo_servicio = $${idx}::tipo_servicio_enum`); vals.push(tipo_servicio); idx++; }

    const query = `
      UPDATE proyectos
      SET ${sets.join(', ')}
      WHERE id = $${idx}
      RETURNING *;
    `;
    vals.push(Number(id));

    const result = await pool.query(query, vals);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: `No se encontró un proyecto con el ID ${id}.` });
    }

    return res.status(200).json({ message: 'Proyecto actualizado exitosamente', proyecto: result.rows[0] });
  } catch (error) {
    console.error('PG ERROR updateProjectById =>', {
      code: error.code, detail: error.detail, constraint: error.constraint, message: error.message,
    });

    if (error.code === '23514') {
      return res.status(400).json({
        message: 'Violación de restricción: fecha_fin debe existir si estado es Finalizado/Cancelado y ser NULL en otros estados.',
        constraint: error.constraint,
      });
    }
    if (error.code === '22P02') {
      return res.status(400).json({
        message: 'Valor inválido para ENUM (estado/tipo_servicio). Debe coincidir exactamente.',
        estado_permitidos: ESTADO_PROYECTO_ENUM,
        tipo_permitidos: TIPO_SERVICIO_ENUM,
      });
    }

    return res.status(500).json({ message: 'Error del servidor al actualizar el proyecto', code: error.code });
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
        p.estado IN ('Solicitado', 'En Progreso')
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

/**
 * Obtiene la cantidad de proyectos por cada tipo de servicio para un estado específico.
 * @param {string} req.params.estado - El estado por el cual filtrar los proyectos.
 */
const getProjectCountByServiceAndStatus = async (req, res) => {
  // 1. Obtenemos el estado desde los parámetros de la URL (ej: /En Progreso)
  const { estado } = req.params;

  // 2. Validamos que el estado sea uno de los permitidos para evitar errores.
  if (!ESTADO_PROYECTO_ENUM.includes(estado)) {
    return res.status(400).json({
      message: 'El estado proporcionado no es válido.',
      valores_permitidos: ESTADO_PROYECTO_ENUM,
      recibido: estado
    });
  }

  try {
    // 3. Creamos la consulta SQL parametrizada para seguridad (evita SQL Injection)
    const query = `
      SELECT 
        tipo_servicio AS servicio,
        COUNT(*) AS cantidad
      FROM 
        proyectos
      WHERE 
        estado = $1
      GROUP BY 
        tipo_servicio
      ORDER BY
        cantidad DESC;
    `;
    
    // 4. Ejecutamos la consulta pasando el estado como parámetro seguro
    const result = await pool.query(query, [estado]);

    // 5. Devolvemos el resultado. Si no hay proyectos con ese estado, devolverá un array vacío [].
    res.json(result.rows);

  } catch (error) {
    console.error('Error en getProjectCountByServiceAndStatus:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * Elimina un proyecto por su ID.
 */
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id) || !Number.isInteger(Number(id))) {
      return res.status(400).json({
        message: "El ID del proyecto debe ser un número entero válido.",
      });
    }

    const existeProyecto = await pool.query(
      "SELECT id FROM proyectos WHERE id = $1",
      [id]
    );

    if (existeProyecto.rowCount === 0) {
      return res.status(404).json({
        message: `No se encontró un proyecto con el ID ${id}.`,
      });
    }

    const dependencias = await pool.query(
      `
      SELECT 
        (SELECT COUNT(*) FROM proyecto_material WHERE id_proyecto = $1) AS materiales,
        (SELECT COUNT(*) FROM bodega_materiales WHERE proyecto_id = $1) AS movimientos
      `,
      [id]
    );

    const { materiales, movimientos } = dependencias.rows[0];

    if (materiales > 0 || movimientos > 0) {
      return res.status(400).json({
        message:
          "No se puede eliminar este proyecto porque tiene materiales o movimientos asociados.",
      });
    }

    const result = await pool.query("DELETE FROM proyectos WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: `No se encontró un proyecto con el ID ${id}.`,
      });
    }

    res.status(200).json({
      message: "Proyecto eliminado exitosamente.",
    });

  } catch (error) {
    console.error("Error en deleteProject:", error);
    res.status(500).json({
      message:
        "Error del servidor al eliminar el proyecto. Verifica si tiene relaciones o intenta nuevamente.",
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
  updateProjectStatus,
  updateProjectById,
  getProjectMaterials,
  getProjectCountByServiceAndStatus,
  deleteProject
};