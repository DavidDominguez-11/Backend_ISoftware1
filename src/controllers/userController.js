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

    console.log('email:', email);
    console.log('password:', password);
    console.log('user.password:', user.contraseña);
    console.log('user', user);

    const passwordMatch = await bcrypt.compare(password, user.contraseña);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id }, 'tu_secreto_super_seguro', {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user.id, email: user.email, Fullname: user.fullname } });
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
