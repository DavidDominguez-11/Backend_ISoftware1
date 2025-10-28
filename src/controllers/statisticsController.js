//statisticsController
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

module.exports = {
  getEntradasVsSalidasPorMes,
  getTop5ProyectosMayorPresupuesto
};