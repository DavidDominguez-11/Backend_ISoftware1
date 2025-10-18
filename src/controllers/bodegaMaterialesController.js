//controllers/bodegaMaterialesController.js
const prisma = require('../prismaClient');

/**
 * GET /bodega-materiales
 * Filtros opcionales: ?tipo=Entrada|Salida&material_id=...&proyecto_id=...
 */
const getBodegaMateriales = async (req, res) => {
  try {
    const movimientos = await prisma.bodega_materiales.findMany({
      include: { material: true },
      orderBy: { fecha: 'desc' }
    });

    if (movimientos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros en la bodega de materiales' });
    }

    res.json(movimientos);
  } catch (error) {
    console.error('Error en getBodegaMateriales:', error);
    res.status(500).json({ message: 'Error del servidor' });
    const { tipo, material_id, proyecto_id } = req.query;
    const where = [];
    const params = [];

    if (tipo)        { params.push(tipo);              where.push(`bm.tipo = $${params.length}`); }
    if (material_id) { params.push(Number(material_id)); where.push(`bm.material_id = $${params.length}`); }
    if (proyecto_id) { params.push(Number(proyecto_id)); where.push(`bm.proyecto_id = $${params.length}`); }

    const sql = `
      SELECT 
        bm.id,
        bm.material_id,
        m.codigo AS material_codigo,
        m.material AS material_nombre,
        bm.tipo,
        bm.cantidad,
        bm.fecha,
        bm.observaciones,
        bm.proyecto_id,
        p.nombre AS proyecto_nombre
      FROM bodega_materiales bm
      JOIN materiales m ON m.id = bm.material_id
      LEFT JOIN proyectos p ON p.id = bm.proyecto_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY bm.fecha DESC, bm.id DESC;
    `;
    const { rows } = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('getBodegaMateriales:', err);
    return res.status(500).json({ message: 'Error del servidor' });
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
          const stock = await prisma.bodega_materiales.aggregate({
              _sum: {
                  cantidad: true
              },
              where: {
                  material_id: material_id,
                  tipo: 'entrada'
              }
          });

          const stockActual = stock._sum.cantidad || 0;
/**
 * POST /bodega-materiales
 * body: { material_id, tipo: 'Entrada'|'Salida', cantidad (>0), fecha? (YYYY-MM-DD), observaciones?, proyecto_id? }
 * Reglas:
 *  - Entrada: cantidad se guarda positiva; proyecto_id debe ser NULL (el CHECK lo exige).
 *  - Salida:  cantidad recibida >0 pero se guarda negativa; proyecto_id es OBLIGATORIO; valida stock.
 */
const postBodegaMaterial = async (req, res) => {
  const client = await pool.connect();
  try {
    const { material_id, tipo, cantidad, fecha, observaciones, proyecto_id } = req.body;

    // Validaciones básicas
    if (!material_id || !tipo || !cantidad) {
      return res.status(400).json({ message: 'Faltan campos: material_id, tipo, cantidad' });
    }
    if (tipo !== 'Entrada' && tipo !== 'Salida') {
      return res.status(400).json({ message: `tipo inválido: ${tipo}` });
    }
    const qty = Number(cantidad);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser un número > 0' });
    }

    await client.query('BEGIN');

    // Existen material (y proyecto si aplica)
    const mat = await client.query('SELECT 1 FROM materiales WHERE id=$1', [material_id]);
    if (mat.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: `Material id=${material_id} no existe` });
    }

    if (tipo === 'Salida') {
      if (!proyecto_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'proyecto_id es obligatorio para Salida' });
      }
      const pro = await client.query('SELECT 1 FROM proyectos WHERE id=$1', [proyecto_id]);
      if (pro.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: `Proyecto id=${proyecto_id} no existe` });
      }

      // Validar stock (recuerda: salidas ya grabadas están negativas)
      const { rows } = await client.query(
        `SELECT COALESCE(SUM(cantidad),0) AS stock FROM bodega_materiales WHERE material_id=$1`,
        [material_id]
      );
      const stockActual = Number(rows[0].stock || 0);
      if (stockActual < qty) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          message: `Stock insuficiente. Stock actual: ${stockActual}, intento de salida: ${qty}`,
        });
      }
  }
  // --- FIN DE LA NUEVA LÓGICA ---

  try {
      const movimiento = await prisma.bodega_materiales.create({
        data: {
          material_id,
          tipo,
          cantidad,
          fecha: new Date(fecha),
          observaciones
        }
      });

      res.status(201).json(movimiento);

  } catch (error) {
      console.error('Error en createBodegaMaterial:', error);
      if (error.code === 'P2025') { // Error específico de Prisma para registro no encontrado
          return res.status(404).json({ message: `El material con id '${material_id}' no existe.` });
      }
      res.status(500).json({ message: 'Error del servidor al crear el movimiento.' });
      // Insert de salida (cantidad negativa, con proyecto_id)
      const insert = await client.query(
        `INSERT INTO bodega_materiales (material_id, tipo, cantidad, fecha, observaciones, proyecto_id)
         VALUES ($1, 'Salida', $2, COALESCE($3::date, CURRENT_DATE), $4, $5)
         RETURNING *;`,
        [material_id, -qty, fecha || null, observaciones || null, proyecto_id]
      );

      await client.query('COMMIT');
      return res.status(201).json(insert.rows[0]);
    }

    // Entrada: proyecto_id debe ser NULL (CHECK lo exige)
    const insert = await client.query(
      `INSERT INTO bodega_materiales (material_id, tipo, cantidad, fecha, observaciones, proyecto_id)
       VALUES ($1, 'Entrada', $2, COALESCE($3::date, CURRENT_DATE), $4, NULL)
       RETURNING *;`,
      [material_id, qty, fecha || null, observaciones || null]
    );

    await client.query('COMMIT');
    return res.status(201).json(insert.rows[0]);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('postBodegaMaterial:', err);
    if (err.code === '23514') {
      // violación de CHECK (ej. signo o proyecto_id)
      return res.status(400).json({ message: 'Violación de restricción CHECK: revisa tipo, cantidad y proyecto_id.' });
    }
    if (err.code === '23503') {
      return res.status(404).json({ message: 'FK no encontrada: material o proyecto inexistente.' });
    }
    return res.status(500).json({ message: 'Error del servidor al crear el movimiento' });
  } finally {
    client.release();
  }
};

module.exports = {
  getBodegaMateriales,
  postBodegaMaterial,
};
