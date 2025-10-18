const prisma = require('../prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const secretTOKEN_SIGN = process.env.TOKEN_SIGN;

// REGISTER
const registerUser = async (req, res) => {
  const { Fullname, email, password } = req.body;
  if (!Fullname || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }
  try {
    // Validar si ya existe el email
    const existingUser = await prisma.usuarios.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    // Guardar usuario
    const user = await prisma.usuarios.create({
      data: {
        nombre: Fullname,
        email,
        contraseña: hashedPassword
      }
    });
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

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt:', req.body);
    // Validar usuario
    const user = await prisma.usuarios.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const passwordMatch = await bcrypt.compare(password, user.contraseña);
    if (!passwordMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });
    // Obtener roles y permisos
    const userRoles = await prisma.usuarios_roles.findMany({
      where: { usuario_id: user.id },
      include: {
        rol: {
          include: {
            roles_permisos: {
              include: { permiso: true }
            }
          }
        }
      }
    });
    const roles = [...new Set(userRoles.map(ur => ur.rol.rol))];
    const permisos = [
      ...new Set(
        userRoles.flatMap(ur => ur.rol.roles_permisos.map(rp => rp.permiso.permiso))
      )
    ];
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