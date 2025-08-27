const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const secretTOKEN_SIGN = process.env.TOKEN_SIGN;

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
    const token = jwt.sign({ id: user.id }, secretTOKEN_SIGN, {
      expiresIn: '1d',
    });
    // Crear cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // CAMBIADO A FALSE PARA DESARROLLO
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

// LOGIN (CON MEJORES LOGS)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validar usuario
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.contraseña);
    if (!passwordMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Obtener roles y permisos
    const rolePermsResult = await pool.query(
      `SELECT r.rol, p.permiso
       FROM usuarios u
       JOIN usuarios_roles ur ON u.id = ur.usuario_id
       JOIN roles r ON ur.rol_id = r.id
       LEFT JOIN roles_permisos rp ON r.id = rp.rol_id
       LEFT JOIN permisos p ON rp.permiso_id = p.id
       WHERE u.id = $1`,
      [user.id]
    );

    const roles = [...new Set(rolePermsResult.rows.map(r => r.rol))];
    const permisos = [...new Set(rolePermsResult.rows.map(r => r.permiso).filter(Boolean))];

    // Generar token con id, email, Fullname, roles y permisos
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        Fullname: user.nombre,
        roles,
        permisos
      },
      secretTOKEN_SIGN,
      { expiresIn: '1d' }
    );

    // Guardar token en cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true en producción
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Respuesta
    res.json({
      id: user.id,
      email: user.email,
      Fullname: user.nombre,
      roles,
      permisos,
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};



// VERIFY TOKEN
// VERIFY TOKEN COMPLETO
const verifyToken = (req, res) => {
  console.log('--- INICIO DE VERIFICACIÓN DE TOKEN ---');

  const token = req.cookies.token;
  console.log('[VERIFY] Token recibido:', token ? 'Sí' : 'No');

  if (!token) {
    console.log('[VERIFY-ERROR] No hay token en la cookie');
    return res.status(401).json({ message: 'No autenticado' });
  }

  jwt.verify(token, secretTOKEN_SIGN, (err, decoded) => {
    if (err) {
      console.log('[VERIFY-ERROR] Token inválido:', err.message);
      return res.status(401).json({ message: 'Token inválido' });
    }

    console.log('[VERIFY] Token válido. Datos del usuario en token:', decoded);

    // Retornar directamente la info que viene en el JWT
    res.json({
      id: decoded.id,
      email: decoded.email,
      Fullname: decoded.Fullname,
      roles: decoded.roles,
      permisos: decoded.permisos
    });

    console.log('--- FIN DE VERIFICACIÓN DE TOKEN ---');
  });
};



// LOGOUT
const logoutUser = (req, res) => {
  console.log('--- INICIO DE LOGOUT ---');
  res.clearCookie('token');
  console.log('[LOGOUT] Cookie eliminada');
  res.json({ message: 'Sesión cerrada correctamente' });
};

module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
};