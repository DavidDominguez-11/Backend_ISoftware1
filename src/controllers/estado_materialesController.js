const pool = require('../config/db');

const getEstadoMaterial = async (req, res) => {
    const getQuery = `
        SELECT 
            m.codigo AS "codigo",
            m.material AS "nombre_material",
            COALESCE(SUM(CASE WHEN bm.tipo = 'entrada' THEN bm.cantidad ELSE -bm.cantidad END), 0) AS "en_bodega",
            COALESCE(SUM(pm.reservado), 0) AS "reservado",
            CASE 
                WHEN COALESCE(SUM(CASE WHEN bm.tipo = 'entrada' THEN bm.cantidad ELSE -bm.cantidad END), 0) <= 0 THEN 'Sin stock'
                WHEN (COALESCE(SUM(pm.ofertada), 0) * 100.0 / NULLIF(COALESCE(SUM(CASE WHEN bm.tipo = 'entrada' THEN bm.cantidad ELSE -bm.cantidad END), 0), 0)) < 30 THEN 'Alto'
                WHEN (COALESCE(SUM(pm.ofertada), 0) * 100.0 / NULLIF(COALESCE(SUM(CASE WHEN bm.tipo = 'entrada' THEN bm.cantidad ELSE -bm.cantidad END), 0), 0)) BETWEEN 30 AND 70 THEN 'Medio'
                ELSE 'Bajo'
            END AS "nivel_stock"
        FROM 
            materiales m
        LEFT JOIN 
            bodega_materiales bm ON m.id = bm.material_id
        LEFT JOIN 
            proyecto_material pm ON m.id = pm.id_material
        GROUP BY 
            m.id, m.codigo, m.material
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

module.exports = {
    getEstadoMaterial
};