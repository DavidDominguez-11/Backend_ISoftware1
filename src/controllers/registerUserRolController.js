const prisma = require('../prismaClient');

const registerUserRol = async (req, res) => {
  const { usuario_id, roles } = req.body;

  if (!usuario_id || !Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ message: 'Datos inválidos. Debes enviar usuario_id y una lista de roles.' });
  }

  try {
    // Verificamos que el usuario exista
    const userCheck = await prisma.usuarios.findUnique({ where: { id: usuario_id } });
    if (!userCheck) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    for (const rol_id of roles) {
      // Verificamos que el rol exista
      const rolCheck = await prisma.roles.findUnique({ where: { id: rol_id } });
      if (!rolCheck) {
        return res.status(404).json({ message: `Rol con id ${rol_id} no existe` });
      }

      // Verificamos si ya tiene ese rol
      const exists = await prisma.usuarios_roles.findFirst({
        where: {
          usuario_id,
          rol_id,
        },
      });

      if (!exists) {
        // Insertamos la relación si no existe
        await prisma.usuarios_roles.create({
          data: {
            usuario_id,
            rol_id,
          },
        });
      }
    }

    res.status(200).json({ message: 'Roles asignados correctamente al usuario.' });

  } catch (error) {
    console.error('Error al registrar roles al usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

const assignRoleToUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;
    
    if (!user_id || !role_id) {
      return res.status(400).json({ message: 'Los campos user_id y role_id son requeridos' });
    }
    
    // Verificar que el usuario existe
    const usuario = await prisma.usuarios.findUnique({ 
      where: { id: parseInt(user_id) } 
    });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que el rol existe
    const rol = await prisma.roles.findUnique({ 
      where: { id: parseInt(role_id) } 
    });
    
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    // Verificar si la relación ya existe
    const existingRelation = await prisma.usuarios_roles.findFirst({
      where: { 
        usuario_id: parseInt(user_id), 
        rol_id: parseInt(role_id) 
      }
    });
    
    if (existingRelation) {
      return res.status(400).json({ message: 'El usuario ya tiene este rol asignado' });
    }
    
    // Crear la relación usuario-rol
    await prisma.usuarios_roles.create({
      data: {
        usuario_id: parseInt(user_id),
        rol_id: parseInt(role_id)
      }
    });
    
    res.status(200).json({ 
      message: 'Roles asignados correctamente al usuario.' 
    });
  } catch (error) {
    console.error('Error en assignRoleToUser:', error);
    res.status(500).json({ message: 'Error del servidor al asignar rol' });
  }
};

const removeRoleFromUser = async (req, res) => {
  try {
    const { user_id, role_id } = req.body;
    
    if (!user_id || !role_id) {
      return res.status(400).json({ message: 'Los campos user_id y role_id son requeridos' });
    }
    
    // Verificar que el usuario existe
    const usuario = await prisma.usuarios.findUnique({ 
      where: { id: parseInt(user_id) } 
    });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que el rol existe
    const rol = await prisma.roles.findUnique({ 
      where: { id: parseInt(role_id) } 
    });
    
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    // Verificar si la relación existe
    const existingRelation = await prisma.usuarios_roles.findFirst({
      where: { 
        usuario_id: parseInt(user_id), 
        rol_id: parseInt(role_id) 
      }
    });
    
    if (!existingRelation) {
      return res.status(404).json({ message: 'El usuario no tiene este rol asignado' });
    }
    
    // Eliminar la relación usuario-rol
    await prisma.usuarios_roles.deleteMany({
      where: {
        usuario_id: parseInt(user_id),
        rol_id: parseInt(role_id)
      }
    });
    
    res.status(200).json({ 
      message: 'Rol removido correctamente del usuario.' 
    });
  } catch (error) {
    console.error('Error en removeRoleFromUser:', error);
    res.status(500).json({ message: 'Error del servidor al remover rol' });
  }
};

// Obtener todos los roles de un usuario
const getUserRoles = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }
    
    // Verificar que el usuario existe
    const usuario = await prisma.usuarios.findUnique({ 
      where: { id: parseInt(user_id) } 
    });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Obtener roles del usuario
    const userRoles = await prisma.usuarios_roles.findMany({
      where: { usuario_id: parseInt(user_id) },
      include: {
        rol: {
          select: {
            id: true,
            rol: true
          }
        }
      }
    });
    
    const roles = userRoles.map(ur => ur.rol);
    
    res.status(200).json({
      usuario_id: parseInt(user_id),
      nombre: usuario.nombre,
      email: usuario.email,
      roles: roles
    });
    
  } catch (error) {
    console.error('Error en getUserRoles:', error);
    res.status(500).json({ message: 'Error del servidor al obtener roles del usuario' });
  }
};

// Obtener todos los usuarios con sus roles
const getUsersWithRoles = async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      include: {
        usuarios_roles: {
          include: {
            rol: {
              select: {
                id: true,
                rol: true
              }
            }
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    const usuariosConRoles = usuarios.map(usuario => ({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      is_admin: usuario.is_admin,
      roles: usuario.usuarios_roles.map(ur => ur.rol)
    }));
    
    res.status(200).json(usuariosConRoles);
    
  } catch (error) {
    console.error('Error en getUsersWithRoles:', error);
    res.status(500).json({ message: 'Error del servidor al obtener usuarios con roles' });
  }
};

module.exports = { 
  registerUserRol, 
  assignRoleToUser, 
  removeRoleFromUser,
  getUserRoles,
  getUsersWithRoles 
};
