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

const deleteMaterial = async (req, res) => {
    const { id } = req.params;

    try {
        // First check if the material exists
        const checkQuery = 'SELECT * FROM materiales WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Material no encontrado' });
        }

        // Check if material is referenced in bodega_materiales
        const checkBodegaQuery = 'SELECT * FROM bodega_materiales WHERE material_id = $1';
        const bodegaResult = await pool.query(checkBodegaQuery, [id]);

        // Check if material is referenced in proyecto_material
        const checkProyectoQuery = 'SELECT * FROM proyecto_material WHERE id_material = $1';
        const proyectoResult = await pool.query(checkProyectoQuery, [id]);

        if (bodegaResult.rows.length > 0 || proyectoResult.rows.length > 0) {
            return res.status(400).json({ 
                message: 'No se puede eliminar el material porque está siendo utilizado en bodega o en proyectos'
            });
        }

        // If no references exist, proceed with deletion
        const deleteQuery = 'DELETE FROM materiales WHERE id = $1';
        await pool.query(deleteQuery, [id]);

        res.json({ message: 'Material eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar material:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getMateriales,
    deleteMaterial
};
