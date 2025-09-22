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

module.exports = {
  getProyectoMaterialEnProgreso,
};
