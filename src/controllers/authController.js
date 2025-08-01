const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGIDTER
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

    const user = result.rows[0];

    // Generar token
    const token = jwt.sign({ id: user.id }, 'tu_secreto_super_seguro', {
      expiresIn: '1d',
    });

    // Crear cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Enviar respuesta con datos del usuario
    res.status(201).json({
      id: user.id,
      email: user.email,
      Fullname: user.nombre,
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error.message);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.contraseña);

    if (!passwordMatch)
      return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id }, 'tu_secreto_super_seguro', {
      expiresIn: '1d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      id: user.id,
      email: user.email,
      Fullname: user.fullname,
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// VERIFY TOKEN
const verifyToken = async (req, res) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).json({ message: 'No autenticado' });

  jwt.verify(token, 'tu_secreto_super_seguro', async (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });

    try {
      const result = await pool.query('SELECT id, email, nombre as "Fullname" FROM usuarios WHERE id = $1', [decoded.id]);
      const user = result.rows[0];

      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

      res.json(user); // Devuelve {id, email, Fullname}
    } catch (error) {
      res.status(500).json({ message: 'Error del servidor' });
    }
  });
};

// LOGOUT
const logoutUser = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
};