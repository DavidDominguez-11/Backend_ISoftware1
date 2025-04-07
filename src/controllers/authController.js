const pool = require('../config/db');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
  const { Fullname, email, password } = req.body;

  if (!Fullname || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // Validar si ya existe el email
    const existingUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar usuario
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, contraseña)
       VALUES ($1, $2, $3) RETURNING *`,
      [Fullname, email, hashedPassword]
    );

    res.status(201).json({ message: 'Usuario registrado', user: result.rows[0] });
  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

module.exports = {
  registerUser,
};
