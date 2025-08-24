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
  console.log('--- INICIO DE PETICIÓN A /login ---');
  const { email, password } = req.body;
  console.log(`[LOGIN-PASO 1] Datos recibidos: email=${email}`);
  
  try {
    console.log('[LOGIN-PASO 2] Entrando al bloque try...');
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    console.log('[LOGIN-PASO 3] Consulta a la base de datos completada.');
    
    if (result.rows.length === 0) {
      console.log('[LOGIN-ERROR] Usuario no encontrado en la BD.');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    console.log('[LOGIN-PASO 4] Usuario encontrado. Procediendo a comparar contraseñas.');
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.contraseña);
    console.log(`[LOGIN-PASO 5] Comparación de contraseñas completada. Resultado: ${passwordMatch}`);
    
    if (!passwordMatch) {
      console.log('[LOGIN-ERROR] Contraseña incorrecta.');
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    
    console.log('[LOGIN-PASO 6] Contraseña correcta. Generando token JWT...');
    const token = jwt.sign({ id: user.id }, 'tu_secreto_super_seguro', {
      expiresIn: '1d',
    });
    console.log('[LOGIN-PASO 7] Token generado exitosamente.');
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // CAMBIADO A FALSE PARA DESARROLLO
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    console.log('[LOGIN-PASO 8] Cookie establecida. Enviando respuesta JSON.');
    res.json({
      id: user.id,
      email: user.email,
      Fullname: user.nombre,
    });
    console.log('--- FIN DE PETICIÓN A /login (ÉXITO) ---');
  
  } catch (error) {
    console.error('--- ERROR INESPERADO EN CATCH DE /login ---');
    console.error(error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// VERIFY TOKEN
const verifyToken = async (req, res) => {
  console.log('--- INICIO DE VERIFICACIÓN DE TOKEN ---');
  const token = req.cookies.token;
  console.log('[VERIFY] Token recibido:', token ? 'Sí' : 'No');
  
  if (!token) {
    console.log('[VERIFY-ERROR] No hay token en la cookie');
    return res.status(401).json({ message: 'No autenticado' });
  }
  
  jwt.verify(token, 'tu_secreto_super_seguro', async (err, decoded) => {
    if (err) {
      console.log('[VERIFY-ERROR] Token inválido:', err.message);
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    console.log('[VERIFY] Token válido. ID de usuario:', decoded.id);
    
    try {
      const result = await pool.query('SELECT id, email, nombre as "Fullname" FROM usuarios WHERE id = $1', [decoded.id]);
      const user = result.rows[0];
      
      if (!user) {
        console.log('[VERIFY-ERROR] Usuario no encontrado en la BD');
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      console.log('[VERIFY] Usuario encontrado:', user);
      res.json(user);
    } catch (error) {
      console.error('[VERIFY-ERROR] Error en la consulta:', error);
      res.status(500).json({ message: 'Error del servidor' });
    }
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