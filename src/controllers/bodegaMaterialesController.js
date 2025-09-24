//controllers/bodegaMaterialesController.js
const prisma = require('../prismaClient');

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
  }
};

module.exports = {
  getBodegaMateriales,
  createBodegaMaterial // Exportar la nueva función
};