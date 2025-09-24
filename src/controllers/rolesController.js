const prisma = require('../prismaClient');

const listRoles = async (req, res) => {
  try {
    const roles = await prisma.roles.findMany({ include: { roles_permisos: { include: { permiso: true } } } });
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error listando roles' });
  }
};

const createRole = async (req, res) => {
  try {
    const { rol } = req.body;
    const r = await prisma.roles.create({ data: { rol } });
    res.status(201).json(r);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando rol' });
  }
};

module.exports = { listRoles, createRole };
