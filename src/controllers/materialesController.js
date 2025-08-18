// controllers/materialesController.js
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

const getMaterialById = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                id,
                codigo,
                material
            FROM 
                materiales
            WHERE 
                id = $1;
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Material no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener material por ID:', error);
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

const createMateriales = async (req, res) => {
    const { materiales } = req.body;

    // Validate request body
    if (!Array.isArray(materiales) || materiales.length === 0) {
        return res.status(400).json({ 
            message: 'Se debe proporcionar un arreglo de materiales no vacío' 
        });
    }

    // Validate each material object
    for (const material of materiales) {
        if (!material.codigo || !material.material || 
            typeof material.codigo !== 'string' || 
            typeof material.material !== 'string') {
            return res.status(400).json({ 
                message: 'Cada material debe tener código y nombre válidos' 
            });
        }
    }

    try {
        // Start a transaction since we're doing multiple inserts
        await pool.query('BEGIN');

        // Check for duplicate códigos
        const codigos = materiales.map(m => m.codigo);
        const checkDuplicatesQuery = `
            SELECT codigo 
            FROM materiales 
            WHERE codigo = ANY($1)
        `;
        const duplicateCheck = await pool.query(checkDuplicatesQuery, [codigos]);

        if (duplicateCheck.rows.length > 0) {
            await pool.query('ROLLBACK');
            return res.status(400).json({
                message: 'Los siguientes códigos ya existen: ' + 
                    duplicateCheck.rows.map(row => row.codigo).join(', ')
            });
        }

        // Prepare the insert query for multiple rows
        const insertQuery = `
            INSERT INTO materiales (codigo, material)
            VALUES ${materiales.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(', ')}
            RETURNING id, codigo, material;
        `;

        // Flatten the materiales array into a single array of values
        const values = materiales.flatMap(m => [m.codigo, m.material]);

        // Execute the insert
        const result = await pool.query(insertQuery, values);

        // Commit the transaction
        await pool.query('COMMIT');

        res.status(201).json({
            message: 'Materiales creados correctamente',
            materiales: result.rows
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al crear materiales:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    getMateriales,
    getMaterialById,
    deleteMaterial,
    createMateriales
};
