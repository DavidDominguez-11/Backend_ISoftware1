const pool = require('../config/db');

const getAllRoles = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM roles');
        res.status(200).json({
            roles: result.rows,
        });
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({ message: 'Error al obtener los roles' });
    }
};

module.exports = {
    getAllRoles,
};
