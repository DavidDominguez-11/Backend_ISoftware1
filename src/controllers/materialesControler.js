// controllers/materialesControler.js
const pool = require('../config/db');

const getMateriales = async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                codigo,
                material
            FROM 
                materiales
            ORDER BY 
                codigo;
        `;
        
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron materiales' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener materiales:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getMateriales
};
