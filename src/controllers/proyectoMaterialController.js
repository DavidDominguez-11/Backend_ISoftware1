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
    // Se espera un array de proyectos, cada uno con sus materiales
    const proyectosConMateriales = req.body;
  
    // Validación inicial: debe ser un array no vacío
    if (!Array.isArray(proyectosConMateriales) || proyectosConMateriales.length === 0) {
      return res.status(400).json({ message: 'El cuerpo de la solicitud debe ser una lista de proyectos no vacía.' });
    }
  
    const client = await pool.connect();
  
    try {
      // Iniciar la transacción
      await client.query('BEGIN');
  
      const insertedRows = [];
  
      // Iterar sobre cada proyecto en la lista
      for (const proyecto of proyectosConMateriales) {
        const { id_proyecto, materiales } = proyecto;
  
        // Validar la estructura de cada objeto de proyecto
        if (!id_proyecto || !Array.isArray(materiales) || materiales.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            message: `Cada elemento en la lista debe tener un "id_proyecto" y una lista de "materiales" no vacía.`,
            objetoConError: proyecto
          });
        }
  
        // Iterar sobre cada material del proyecto para insertarlo
        for (const material of materiales) {
          const { id_material, ofertada } = material;
  
          // Validar que los campos obligatorios existan y sean correctos en cada material
          if (!id_material || ofertada === undefined || typeof ofertada !== 'number' || ofertada < 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              message: `Cada material debe tener 'id_material' y un valor numérico no negativo para 'ofertada'.`,
              objetoConError: material
            });
          }
  
          const insertQuery = `
            INSERT INTO proyecto_material (id_proyecto, id_material, ofertada, en_obra, reservado)
            VALUES ($1, $2, $3, 0, 0)
            RETURNING *;
          `;
          const values = [id_proyecto, id_material, ofertada];
  
          const result = await client.query(insertQuery, values);
          insertedRows.push(result.rows[0]);
        }
      }
  
      // Si todas las inserciones son exitosas, confirmar la transacción
      await client.query('COMMIT');
  
      // Retornar todos los registros creados
      res.status(201).json(insertedRows);
  
    } catch (error) {
      // En caso de cualquier error, deshacer la transacción
      await client.query('ROLLBACK');
      console.error('Error en createProyectoMaterial:', error);
  
      // Manejar error específico de violación de clave foránea
      if (error.code === '23503') {
        return res.status(404).json({ message: 'Error de clave foránea. Verifique que el id_proyecto y todos los id_material existan.' });
      }
  
      res.status(500).json({ message: 'Error del servidor al registrar los materiales.' });
    } finally {
      // Liberar el cliente de la pool, independientemente del resultado
      client.release();
    }
  };
  

module.exports = {
  getProyectoMaterialEnProgreso,
  createProyectoMaterial,
};
