//controllers/bodegaMaterialesController.js
const pool = require('../config/db');

const getBodegaMateriales = async (req, res) => {
  try {
    // Consulta SQL que une las tablas bodega_materiales y materiales
    const query = `
      SELECT 
        bm.id,
        bm.material_id,
        m.codigo AS material_codigo,
        m.material AS material_nombre,
        bm.tipo,
        bm.cantidad,
        bm.fecha,
        bm.observaciones
      FROM 
        bodega_materiales bm
      JOIN 
        materiales m ON bm.material_id = m.id
      ORDER BY 
        bm.fecha DESC;
    `;
    
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros en la bodega de materiales' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error en getBodegaMateriales:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = {
  getBodegaMateriales
};
