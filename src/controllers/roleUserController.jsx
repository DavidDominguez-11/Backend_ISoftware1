const pool = require('../config/db');
const format = require('pg-format'); // IMPORTANTE

const asignarMultiplesRolesAUsuario = async (req, res) => {
  const { usuario_id, roles } = req.body;

  try {
    if (!usuario_id || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: 'usuario_id y un array de rol_id son requeridos' });
    }

    // Crear array de arrays para insertar múltiples valores
    const values = roles.map(rol_id => [usuario_id, rol_id]);

    const query = format(`
      INSERT INTO usuarios_roles (usuario_id, rol_id)
      VALUES %L
      RETURNING *;
    `, values);

    const result = await pool.query(query);

    res.status(201).json({
      message: 'Roles asignados correctamente',
      asignaciones: result.rows,
    });
  } catch (error) {
    console.error('Error al asignar roles:', error);
    res.status(500).json({ message: 'Error al asignar los roles al usuario' });
  }
};

module.exports = {
  asignarMultiplesRolesAUsuario,
};

//JSON que recibe
//{
//  "usuario_id": 3,
//  "roles": [1, 2, 5]
//}
