const pool = require('../config/db');
const bcrypt = require('bcrypt');

const crearUsuarioCompleto = async (req, res) => {
  const { usuario, telefonos, roles } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(usuario.password, 10);

    // Insertar usuario
    const insertUserQuery = `
      INSERT INTO usuarios (nombre, email, contraseña)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const { rows } = await client.query(insertUserQuery, [
      usuario.nombre,
      usuario.correo,
      hashedPassword
    ]);
    const userId = rows[0].id;

    // Insertar teléfonos
    const insertPhoneQuery = `
      INSERT INTO telefonos (usuario_id, telefono)
      VALUES ($1, $2)
    `;
    for (const telefono of telefonos) {
      await client.query(insertPhoneQuery, [userId, telefono]);
    }

    // Insertar roles
    const insertRoleQuery = `
      INSERT INTO usuarios_roles (usuario_id, rol_id)
      VALUES ($1, $2)
    `;
    for (const rolId of roles) {
      await client.query(insertRoleQuery, [userId, rolId]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Usuario creado exitosamente', userId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  } finally {
    client.release();
  }
};

module.exports = { crearUsuarioCompleto };
