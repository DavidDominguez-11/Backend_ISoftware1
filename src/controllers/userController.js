const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.contraseña);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id }, 'tu_secreto_super_seguro', {
      expiresIn: '1d',
    });

    // Establecer cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Asegura que sólo en producción se use HTTPS
      sameSite: 'lax', // Ayuda con CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    // Enviar respuesta con los datos del usuario (sin token)
    res.json({
      user: {
        id: user.id,
        email: user.email,
        Fullname: user.fullname
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

const contra = async (req, res) => {
  try {
    const email = "test1@gmail.com"
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    res.json(result);
  } catch (error) {
    console.error('no se pudo:', error);
    res.status(500).json({ message: 'no jalo' });
  }
};

module.exports = {
  loginUser,
  contra,
};
