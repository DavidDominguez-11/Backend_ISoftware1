const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Simple auth middleware for testing
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }
  // For testing, we just check that token exists
  next();
};

// POST /services/register-user-rol
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { usuario_id, roles } = req.body;
    
    if (!usuario_id || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: 'Parámetros inválidos' });
    }

    const roleId = roles[0];

    // 1. Check if user exists
    const user = await prisma.usuarios.findUnique({ where: { id: usuario_id } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 2. Check if role exists
    const role = await prisma.roles.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // 3. Check if relationship already exists
    const existing = await prisma.usuarios_roles.findFirst({
      where: { usuario_id: usuario_id, rol_id: roleId }
    });

    // 4. Insert the relationship if it doesn't exist
    if (!existing) {
      await prisma.usuarios_roles.create({
        data: { usuario_id: usuario_id, rol_id: roleId }
      });
    }

    res.status(200).json({ message: 'Roles asignados correctamente al usuario.' });

  } catch (error) {
    console.error('Error in role assignment:', error);
    res.status(500).json({ 
      message: 'Error del servidor al asignar roles', 
      error: error.message 
    });
  }
});

module.exports = router;
