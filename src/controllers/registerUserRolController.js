const pool = require('../config/db');

const registerUserRol = async (req, res) => {
  const { usuario_id, roles } = req.body;

  if (!usuario_id || !Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ message: 'Datos inválidos. Debes enviar usuario_id y una lista de roles.' });
  }

  try {
    // Verificamos que el usuario exista
    const userCheck = await pool.query('SELECT * FROM usuarios WHERE id = $1', [usuario_id]);
    if (userCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    for (const rol_id of roles) {
      // Verificamos que el rol exista
      const rolCheck = await pool.query('SELECT * FROM roles WHERE id = $1', [rol_id]);
      if (rolCheck.rowCount === 0) {
        return res.status(404).json({ message: `Rol con id ${rol_id} no existe` });
      }

      // Verificamos si ya tiene ese rol
      const exists = await pool.query(
        'SELECT * FROM usuarios_roles WHERE usuario_id = $1 AND rol_id = $2',
        [usuario_id, rol_id]
      );

      if (exists.rowCount === 0) {
        // Insertamos la relación si no existe
        await pool.query(
          'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES ($1, $2)',
          [usuario_id, rol_id]
        );
      }
    }

    res.status(200).json({ message: 'Roles asignados correctamente al usuario.' });

  } catch (error) {
    console.error('Error al registrar roles al usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { registerUserRol };
