const request = require('supertest');
const app = require('../src/app');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock de la base de datos
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const pool = require('../src/config/db');

describe('Auth Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar mock por defecto para evitar errores
    pool.query.mockResolvedValue({ rows: [] });
  });

  describe('POST /services/auth/register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        Fullname: 'Juan Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      // Mock de la consulta para verificar si el usuario existe
      pool.query.mockResolvedValueOnce({ rows: [] });
      
      // Mock de la consulta para insertar el usuario
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          nombre: 'Juan Pérez',
          email: 'juan@test.com'
        }]
      });

      const response = await request(app)
        .post('/services/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('Fullname');
      expect(response.body.email).toBe('juan@test.com');
      expect(response.body.Fullname).toBe('Juan Pérez');
    });

    it('debería retornar error 400 cuando faltan campos requeridos', async () => {
      const userData = {
        Fullname: 'Juan Pérez',
        // email faltante
        password: 'password123'
      };

      const response = await request(app)
        .post('/services/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Faltan campos requeridos');
    });

    it('debería retornar error 409 cuando el email ya está registrado', async () => {
      const userData = {
        Fullname: 'Juan Pérez',
        email: 'juan@test.com',
        password: 'password123'
      };

      // Mock de la consulta para simular que el usuario ya existe
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'juan@test.com' }]
      });

      const response = await request(app)
        .post('/services/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('El correo ya está registrado');
    });
  });

  describe('POST /services/auth/login', () => {
    it('debería hacer login exitosamente con credenciales válidas', async () => {
      const loginData = {
        email: 'juan@test.com',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash('password123', 10);

      // Mock de la consulta para simular usuario existente
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          email: 'juan@test.com',
          contraseña: hashedPassword,
          fullname: 'Juan Pérez'
        }]
      });

      const response = await request(app)
        .post('/services/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('Fullname');
    });

    it('debería retornar error 404 cuando el usuario no existe', async () => {
      const loginData = {
        email: 'usuario@inexistente.com',
        password: 'password123'
      };

      // Mock de la consulta para simular usuario no encontrado
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/services/auth/login')
        .send(loginData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Usuario no encontrado');
    });
  });
}); 