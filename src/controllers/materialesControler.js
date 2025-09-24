// controllers/materialesControler.js
const prisma = require('../prismaClient');

const listMaterials = async (req, res) => {
  try {
    const items = await prisma.materiales.findMany();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error listando materiales' });
  }
};

const getMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.materiales.findUnique({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ error: 'Material no encontrado' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo material' });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { codigo, material } = req.body;
    const m = await prisma.materiales.create({ data: { codigo, material } });
    res.status(201).json(m);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando material' });
  }
};

module.exports = { createMaterial, listMaterials, getMaterial };
