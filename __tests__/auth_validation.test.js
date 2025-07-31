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
});