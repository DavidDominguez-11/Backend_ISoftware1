const prisma = require('../prismaClient');

const getUsersInfo = async (req, res) => {
    try {
        const users = await prisma.usuarios.findMany({
            select: {
                id: true,
                nombre: true,
                email: true,
                usuarios_roles: {
                    select: {
                        rol: {
                            select: { rol: true }
                        }
                    }
                }
            }
        });

        // Fetch permissions for each user
        const usersWithPerms = await Promise.all(users.map(async user => {
            // Get all roles for the user
            const roles = user.usuarios_roles.map(ur => ur.rol.rol);
            // Get all permissions for these roles
            const perms = await prisma.roles_permisos.findMany({
                where: {
                    rol: { rol: { in: roles } }
                },
                select: {
                    permiso: { select: { permiso: true } }
                }
            });
            return {
                usuario_id: user.id,
                nombre_usuario: user.nombre,
                email: user.email,
                roles: roles.join(', '),
                permisos: perms.map(p => p.permiso.permiso).join(', ')
            };
        }));

        res.status(200).json(usersWithPerms);
    } catch (error) {
        console.error('Error al obtener informacion de los usuarios:', error);
        res.status(500).json({
            message: 'Error no se ha podido obtener la informacion de los usuarios',
            error: error.message
        });
    }
};

const getClientsCount = async (req, res) => {
    try {
        const count = await prisma.usuarios_roles.count({
            where: {
                rol: {
                    rol: 'cliente'
                }
            }
        });
        res.json({ total_clientes: count });
    } catch (error) {
        console.error('Error en getClientsCount:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
};

module.exports = {
    getUsersInfo,
    getClientsCount
};