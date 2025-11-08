//controllers/statisticsController.js
const pool = require('../config/db');

/**
 * Obtiene estadísticas de entradas vs salidas por mes - solo conteo de movimientos
 */
const getEntradasVsSalidasPorMes = async (req, res) => {
  try {
    const query = `
      SELECT 
        TO_CHAR(fecha, 'Month') AS mes,
        COUNT(CASE WHEN tipo = 'Entrada' THEN 1 END) AS entradas,
        COUNT(CASE WHEN tipo = 'Salida' THEN 1 END) AS salidas
      FROM bodega_materiales
      WHERE EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY TO_CHAR(fecha, 'Month')
      ORDER BY MIN(EXTRACT(MONTH FROM fecha));
    `;

    const result = await pool.query(query);

    const estadisticas = result.rows.map(row => ({
      mes: row.mes.trim(),
      entradas: parseInt(row.entradas),
      salidas: parseInt(row.salidas)
    }));

    res.json(estadisticas);

  } catch (error) {
    console.error('Error en getEntradasVsSalidasPorMes:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener estadísticas',
      error: error.message 
    });
  }
};

const getTop5ProyectosMayorPresupuesto = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        nombre,
        presupuesto,
        estado
      FROM proyectos
      ORDER BY presupuesto DESC
      LIMIT 5;
    `;

    const result = await pool.query(query);

    const proyectos = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      presupuesto: parseFloat(row.presupuesto), // Convertir a número
      estado: row.estado
    }));

    res.json(proyectos);

  } catch (error) {
    console.error('Error en getTop5ProyectosMayorPresupuesto:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener los proyectos',
      error: error.message 
    });
  }
};

/**
 * Obtiene los top 5 materiales más usados basados en popularidad
 */
const getTop5MaterialesMasUsados = async (req, res) => {
  try {
    const query = `
      WITH total_salida AS (
        SELECT SUM(ABS(cantidad)) AS total_cantidad
        FROM bodega_materiales
        WHERE tipo = 'Salida'
      ),
      materiales_usados AS (
        SELECT
          m.id,
          m.codigo,
          m.material,
          SUM(ABS(bm.cantidad)) AS cantidad_usada
        FROM materiales m
        JOIN bodega_materiales bm ON m.id = bm.material_id
        WHERE bm.tipo = 'Salida'
        GROUP BY m.id, m.codigo, m.material
      )
      SELECT
        mu.id,
        mu.codigo,
        mu.material,
        ROUND((mu.cantidad_usada::DECIMAL / ts.total_cantidad) * 100, 2) AS popularidad
      FROM materiales_usados mu
      CROSS JOIN total_salida ts
      ORDER BY mu.cantidad_usada DESC
      LIMIT 5;
    `;

    const result = await pool.query(query);

    const materiales = result.rows.map(row => ({
      id: row.id,
      codigo: row.codigo,
      material: row.material,
      popularidad: parseFloat(row.popularidad)
    }));

    res.json(materiales);

  } catch (error) {
    console.error('Error en getTop5MaterialesMasUsados:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener los materiales',
      error: error.message 
    });
  }
};

module.exports = {
  getEntradasVsSalidasPorMes,
  getTop5ProyectosMayorPresupuesto,
  getTop5MaterialesMasUsados
};