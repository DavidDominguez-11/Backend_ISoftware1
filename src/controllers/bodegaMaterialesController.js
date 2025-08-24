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
  if (tipo !== 'entrada' && tipo !== 'salida') {
      return res.status(400).json({ message: `El tipo de movimiento '${tipo}' no es válido.` });
  }
  if (cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser un número positivo.' });
  }

  // --- NUEVA LÓGICA DE VALIDACIÓN DE STOCK ---
  if (tipo === 'salida') {
      try {
          // Calculamos el stock actual para ese material.
          const stockQuery = `
              SELECT 
                  SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE -cantidad END) as stock
              FROM bodega_materiales 
              WHERE material_id = $1;
          `;
          const stockResult = await pool.query(stockQuery, [material_id]);
          const stockActual = parseInt(stockResult.rows[0].stock || 0, 10);

          // Si el stock es insuficiente, rechazamos la operación.
          if (stockActual < cantidad) {
              return res.status(400).json({ 
                  message: `Stock insuficiente para el material ID ${material_id}. Stock actual: ${stockActual}, se intentó sacar: ${cantidad}.` 
              });
          }
      } catch (error) {
          console.error('Error al verificar el stock:', error);
          return res.status(500).json({ message: 'Error del servidor al verificar el stock.' });
      }
  }
  // --- FIN DE LA NUEVA LÓGICA ---

  try {
      const insertQuery = `
          INSERT INTO bodega_materiales (material_id, tipo, cantidad, fecha, observaciones)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
      `;
      const values = [material_id, tipo, cantidad, fecha, observaciones || null];
      
      const result = await pool.query(insertQuery, values);
      
      res.status(201).json(result.rows[0]);
      
  } catch (error) {
      console.error('Error en createBodegaMaterial:', error);
      if (error.code === '23503') {
          return res.status(404).json({ message: `El material con id '${material_id}' no existe.` });
      }
      res.status(500).json({ message: 'Error del servidor al crear el movimiento.' });
  }
};

module.exports = {
  getBodegaMateriales,
  createBodegaMaterial // Exportar la nueva función
};