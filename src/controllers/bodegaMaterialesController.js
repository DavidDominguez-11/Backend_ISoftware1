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

const createBodegaMaterial = async (req, res) => {
    const { material_id, tipo, cantidad, fecha, observaciones } = req.body;
  
    // Validación básica de los datos de entrada
    if (!material_id || !tipo || !cantidad || !fecha) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: material_id, tipo, cantidad, fecha.' });
    }
  
    // Opcional: Validar que el tipo sea uno de los valores permitidos por el ENUM
    const tiposPermitidos = ['entrada', 'salida']; // Ajusta esto según tu ENUM
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ message: `El tipo de movimiento '${tipo}' no es válido.` });
    }
  
    try {
      const query = `
        INSERT INTO bodega_materiales (material_id, tipo, cantidad, fecha, observaciones)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [material_id, tipo, cantidad, fecha, observaciones || null];
      
      const result = await pool.query(query, values);
  
      // Se ha modificado la respuesta para enviar solo los datos del registro creado.
      res.status(201).json(result.rows[0]);
      
    } catch (error) {
      console.error('Error en createBodegaMaterial:', error);
      // Manejo de error específico para llave foránea
      if (error.code === '23503') { // Código de error para violación de foreign key en PostgreSQL
          return res.status(404).json({ message: `El material con id '${material_id}' no existe.` });
      }
      res.status(500).json({ message: 'Error del servidor' });
    }
  };


module.exports = {
  getBodegaMateriales,
  createBodegaMaterial // Exportar la nueva función
};