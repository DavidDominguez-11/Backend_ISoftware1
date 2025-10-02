const pool = require('../config/db');

const getEstadoMaterial = async (req, res) => {
  const getQuery = `
    WITH bm AS (
      SELECT material_id, SUM(cantidad)::int AS en_bodega
      FROM bodega_materiales
      GROUP BY material_id
    ),
    pm AS (
      SELECT id_material,
             COALESCE(SUM(reservado), 0)::int AS reservado,
             COALESCE(SUM(ofertada), 0)::int AS ofertada
      FROM proyecto_material
      GROUP BY id_material
    )
    SELECT 
      m.id AS "id_material",
      m.codigo AS "codigo",
      m.material AS "nombre_material",
      COALESCE(bm.en_bodega, 0) AS "en_bodega",
      COALESCE(pm.reservado, 0) AS "reservado",
      -- disponible "real" (puede ser negativo)
      (COALESCE(bm.en_bodega, 0) - COALESCE(pm.reservado, 0)) AS "disponible",
      -- Si quieres forzar mínimo 0, usa esta línea en su lugar:
      -- GREATEST(COALESCE(bm.en_bodega,0) - COALESCE(pm.reservado,0), 0) AS "disponible",
      CASE 
        WHEN COALESCE(bm.en_bodega, 0) <= 0 THEN 'Sin stock'
        WHEN (COALESCE(pm.ofertada, 0) * 100.0) / NULLIF(COALESCE(bm.en_bodega, 0), 0) < 30 THEN 'Alto'
        WHEN (COALESCE(pm.ofertada, 0) * 100.0) / NULLIF(COALESCE(bm.en_bodega, 0), 0) BETWEEN 30 AND 70 THEN 'Medio'
        ELSE 'Bajo'
      END AS "nivel_stock"
    FROM materiales m
    LEFT JOIN bm ON bm.material_id = m.id
    LEFT JOIN pm ON pm.id_material = m.id
    ORDER BY m.codigo;
  `;

  try {
    const result = await pool.query(getQuery);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener el estado de materiales:', error);
    res.status(500).json({
      message: 'Error no se ha podido obtener el Estado de Materiales',
      error: error.message
    });
  }
};

module.exports = { getEstadoMaterial };
