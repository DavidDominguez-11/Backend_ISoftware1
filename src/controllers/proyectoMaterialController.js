//controllers/proyectoMaterialController
const pool = require('../config/db');

/**
 * Obtiene todos los materiales asociados a proyectos que se encuentran en estado 'en progreso'.
 * Realiza un JOIN con las tablas de proyectos y materiales para enriquecer la información.
 */
const getProyectoMaterialEnProgreso = async (req, res) => {
  try {
    // Consulta SQL para seleccionar los materiales de proyectos en progreso
    const query = `
      SELECT
        pm.id,
        pm.id_proyecto,
        p.nombre AS nombre_proyecto,
        p.estado AS estado_proyecto,
        pm.id_material,
        m.codigo AS codigo_material,
        m.material AS nombre_material,
        pm.ofertada,
        pm.en_obra,
        pm.reservado
      FROM
        proyecto_material pm
      JOIN
        proyectos p ON pm.id_proyecto = p.id
      JOIN
        materiales m ON pm.id_material = m.id
      WHERE
        p.estado = 'en progreso'
      ORDER BY
        p.nombre, m.material;
    `;

    const result = await pool.query(query);

    // Si no se encuentran registros, se devuelve un 404
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron materiales para proyectos en progreso' });
    }

    // Se envían los resultados en formato JSON
    res.json(result.rows);

  } catch (error) {
    console.error('Error en getProyectoMaterialEnProgreso:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

/**
 * Crea nuevas entradas en la tabla proyecto_material a partir de una lista de proyectos con sus materiales.
 * El cuerpo de la solicitud debe ser un array de objetos: [ { "id_proyecto": X, "materiales": [ { "id_material": Y, "ofertada": Z } ] } ]
 * Los campos 'en_obra' y 'reservado' se inicializan en 0.
 * La operación se realiza dentro de una transacción para garantizar la atomicidad.
 */
const createProyectoMaterial = async (req, res) => {
  const proyectosConMateriales = req.body;

  // Validación inicial
  if (!Array.isArray(proyectosConMateriales) || proyectosConMateriales.length === 0) {
    return res.status(400).json({
      message: 'El cuerpo de la solicitud debe ser una lista de proyectos no vacía.'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const insertedOrUpdatedRows = [];

    for (const proyecto of proyectosConMateriales) {
      const { id_proyecto, materiales } = proyecto;

      if (!id_proyecto || !Array.isArray(materiales) || materiales.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Cada elemento en la lista debe tener un "id_proyecto" y una lista de "materiales" no vacía.`,
          objetoConError: proyecto
        });
      }

      for (const material of materiales) {
        const { id_material, ofertada } = material;

        if (!id_material || ofertada === undefined || typeof ofertada !== 'number' || ofertada < 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            message: `Cada material debe tener 'id_material' y un valor numérico no negativo para 'ofertada'.`,
            objetoConError: material
          });
        }

        // Si el material ya existe en ese proyecto, se actualiza.
        // Si no existe, se inserta uno nuevo.
        const upsertQuery = `
          INSERT INTO proyecto_material (id_proyecto, id_material, ofertada, en_obra, reservado)
          VALUES ($1, $2, $3, 0, 0)
          ON CONFLICT (id_proyecto, id_material)
          DO UPDATE SET ofertada = proyecto_material.ofertada + EXCLUDED.ofertada
          RETURNING *;
        `;

        const values = [id_proyecto, id_material, ofertada];
        const result = await client.query(upsertQuery, values);
        insertedOrUpdatedRows.push(result.rows[0]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json(insertedOrUpdatedRows);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en createProyectoMaterial:', error);

    if (error.code === '23503') {
      return res.status(404).json({
        message: 'Error de clave foránea. Verifique que el id_proyecto y los materiales existan.'
      });
    }

    res.status(500).json({
      message: 'Error del servidor al registrar los materiales.'
    });
  } finally {
    client.release();
  }
};

  

/**
 * Obtiene todos los materiales para un proyecto específico, dado su ID.*/
// controllers/projectMaterials.controller.js
const getProyectoMaterialById = async (req, res) => {
  // ✅ Acepta ambos nombres de parámetro
  const projectIdRaw = req.params.projectId ?? req.params.id_proyecto;
  const projectId = parseInt(projectIdRaw, 10);

  if (!Number.isInteger(projectId)) {
    return res.status(400).json({ message: "projectId inválido" });
  }

  try {
    const q = `
      WITH bodega AS (
        SELECT material_id, COALESCE(SUM(cantidad),0) AS en_bodega
        FROM bodega_materiales
        GROUP BY material_id
      ),
      reservados AS (
        SELECT id_material AS material_id, COALESCE(SUM(reservado),0) AS reservado_total
        FROM proyecto_material
        GROUP BY id_material
      )
      SELECT
        pm.id_material                                  AS material_id,
        m.codigo,
        m.material,
        pm.ofertada                                     AS ofertado,
        pm.reservado,
        pm.en_obra,
        (pm.ofertada - pm.en_obra)                      AS pendiente_entrega,
        COALESCE(b.en_bodega, 0)                        AS en_bodega,
        COALESCE(rv.reservado_total, 0)                 AS reservado_total,
        (COALESCE(b.en_bodega,0) - COALESCE(rv.reservado_total,0)) AS disponible_global,
        GREATEST(
          0,
          (pm.ofertada - pm.en_obra)
          - (COALESCE(b.en_bodega,0) - COALESCE(rv.reservado_total,0))
        )                                               AS pendiente_compra
      FROM proyecto_material pm
      JOIN materiales m      ON m.id = pm.id_material
      LEFT JOIN bodega   b   ON b.material_id  = pm.id_material
      LEFT JOIN reservados rv ON rv.material_id = pm.id_material
      WHERE pm.id_proyecto = $1
      ORDER BY m.material;
    `;

    const { rows } = await pool.query(q, [projectId]);

    // ✅ siempre devuelve { data: [...] }
    if (rows.length === 0) {
      return res.status(200).json({
        message: `No se encontraron materiales para el proyecto con ID ${projectId}`,
        data: [],
      });
    }

    return res.status(200).json({ data: rows });

  } catch (e) {
    console.error("Error en getProyectoMaterialById:", e);
    return res.status(500).json({
      message: "Error interno al obtener los materiales del proyecto.",
      error: e.message,
    });
  }
};


module.exports = {
  getProyectoMaterialEnProgreso,
  createProyectoMaterial,
  getProyectoMaterialById,
};
