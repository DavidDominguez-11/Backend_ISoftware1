const pool = require('../config/db');

const getUsersInfo = async (req, res) => {
    const getQuery = `
        SELECT 
            u.id AS usuario_id,
            u.nombre AS nombre_usuario,
            u.email,
            STRING_AGG(DISTINCT r.rol, ', ') AS roles,
            STRING_AGG(DISTINCT p.permiso, ', ') AS permisos
        FROM 
            usuarios u
        JOIN 
            usuarios_roles ur ON u.id = ur.usuario_id
        JOIN 
            roles r ON ur.rol_id = r.id
        JOIN 
            roles_permisos rp ON r.id = rp.rol_id
        JOIN 
            permisos p ON rp.permiso_id = p.id
        GROUP BY 
            u.id, u.nombre, u.email
        ORDER BY 
            u.nombre;
    `;

    try {
        const result = await pool.query(getQuery);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener informacion de los usuarios:', error);
        res.status(500).json({
            message: 'Error no se ha podido obtener la informacion de los usuarios',
            error: error.message
        });
    }
};

module.exports = {
    getUsersInfo
};