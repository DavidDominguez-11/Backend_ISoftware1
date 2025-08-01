const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');

describe('AUTH1 - Flujo Completo de Autenticación', () => {
  // Datos de prueba
  const testUser = {
    Fullname: "Usuario de Prueba",
    email: "auth_test@validation.com",
    password: "password123"
  };

  let authCookie;

  // Limpieza antes y después de las pruebas
  beforeAll(async () => {
    // Eliminar usuario de prueba si existe
    await pool.query('DELETE FROM usuarios WHERE email = $1', [testUser.email]);
  });

  afterAll(async () => {
    // Cerrar conexión a la base de datos
    await pool.end();
  });

  it('1.1 - Debe registrar un nuevo usuario exitosamente', async () => {
    const response = await request(app)
      .post('/services/auth/register')
      .send(testUser);
    
    // Verificaciones HTTP
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(testUser.email);
    expect(response.body.Fullname).toBe(testUser.Fullname);

    // Verificación en base de datos
    const dbUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [testUser.email]);
    expect(dbUser.rows.length).toBe(1);
    
    // Verificar que la contraseña está hasheada
    const passwordMatch = await bcrypt.compare(testUser.password, dbUser.rows[0].contraseña);
    expect(passwordMatch).toBe(true);
  });  

  it('1.2 - Debe iniciar sesión y obtener token', async () => {
    const response = await request(app)
      .post('/services/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    // Verificaciones HTTP
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();
    
    // Guardar cookie para pruebas siguientes
    authCookie = response.headers['set-cookie'][0];
    
    // Verificar cuerpo de respuesta
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(testUser.email);
  });  


});