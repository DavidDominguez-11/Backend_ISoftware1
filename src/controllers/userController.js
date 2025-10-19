const prisma = require('../prismaClient');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await prisma.usuarios.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        is_admin: true,
        usuarios_roles: {
          include: {
            rol: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios' });
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error en getUsers:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  
  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    const user = await prisma.usuarios.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        is_admin: true,
        usuarios_roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        message: `No se encontró un usuario con el ID ${id}.` 
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Error en getUserById:', error);
    res.status(500).json({ message: 'Error del servidor al obtener el usuario.' });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, is_admin } = req.body;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.usuarios.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        message: `No se encontró un usuario con el ID ${id}.` 
      });
    }

    // Check for duplicate email (excluding current user)
    if (email && email !== existingUser.email) {
      const duplicateUser = await prisma.usuarios.findFirst({
        where: { 
          email,
          NOT: { id: parseInt(id) }
        }
      });

      if (duplicateUser) {
        return res.status(400).json({ 
          message: 'El email ya está registrado por otro usuario' 
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;
    if (is_admin !== undefined) updateData.is_admin = is_admin;

    const updatedUser = await prisma.usuarios.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        is_admin: true
      }
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: updatedUser
    });

  } catch (error) {
    console.error('Error en updateUser:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar el usuario.' });
  }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || !Number.isInteger(Number(id))) {
    return res.status(400).json({ 
      message: 'El ID debe ser un número entero válido',
      received: id
    });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.usuarios.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        message: `No se encontró un usuario con el ID ${id}.` 
      });
    }

    // Delete user roles first (cascade delete)
    await prisma.usuarios_roles.deleteMany({
      where: { usuario_id: parseInt(id) }
    });

    // Delete the user
    await prisma.usuarios.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en deleteUser:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar el usuario.' });
  }
};

// Asignar rol a usuario
const assignRoleToUser = async (req, res) => {
  const { userId, roleId } = req.body;

  if (!userId || !roleId) {
    return res.status(400).json({ 
      message: 'Los campos userId y roleId son requeridos' 
    });
  }

  try {
    // Check if user exists
    const user = await prisma.usuarios.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    // Check if role exists
    const role = await prisma.roles.findUnique({
      where: { id: parseInt(roleId) }
    });

    if (!role) {
      return res.status(404).json({ 
        message: 'Rol no encontrado' 
      });
    }

    // Check if user already has this role
    const existingUserRole = await prisma.usuarios_roles.findFirst({
      where: { 
        usuario_id: parseInt(userId),
        rol_id: parseInt(roleId)
      }
    });

    if (existingUserRole) {
      return res.status(400).json({ 
        message: 'El usuario ya tiene este rol asignado' 
      });
    }

    // Assign role to user
    const userRole = await prisma.usuarios_roles.create({
      data: {
        usuario_id: parseInt(userId),
        rol_id: parseInt(roleId)
      }
    });

    res.status(201).json({
      message: 'Rol asignado exitosamente al usuario',
      userRole
    });

  } catch (error) {
    console.error('Error en assignRoleToUser:', error);
    res.status(500).json({ message: 'Error del servidor al asignar el rol.' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignRoleToUser
};