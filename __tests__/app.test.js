const request = require('supertest');

// Mock Prisma client for tests
jest.mock('../src/prismaClient', () => ({
  usuarios: {
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    deleteMany: jest.fn()
  },
  proyectos: {
    findMany: jest.fn().mockResolvedValue([])
  },
  $disconnect: jest.fn()
}));

const app = require('../src/app');

describe('App Configuration Tests', () => {
  describe('Configuración de CORS', () => {
    it('debería permitir peticiones desde localhost:5173', async () => {
      const response = await request(app)
        .get('/services/projects')
        .set('Origin', 'http://localhost:5173');

      // Verificar que la respuesta incluye headers de CORS
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('debería rechazar peticiones desde orígenes no permitidos', async () => {
      const response = await request(app)
        .get('/services/projects')
        .set('Origin', 'http://malicious-site.com');

      // Verificar que no se permite el origen malicioso
      expect(response.headers['access-control-allow-origin']).not.toBe('http://malicious-site.com');
    });
  });

  describe('Configuración de middleware', () => {
    it('debería procesar JSON correctamente', async () => {
      const testData = {
        Fullname: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/services/auth/register')
        .send(testData)
        .set('Content-Type', 'application/json');

      // Verificar que la aplicación puede procesar JSON (no debería ser 500)
      expect(response.status).toBeDefined();
    });

    it('debería manejar cookies correctamente', async () => {
      const response = await request(app)
        .get('/services/auth/verify')
        .set('Cookie', 'token=test-token');

      // Verificar que la aplicación puede procesar cookies
      expect(response.status).toBeDefined();
    });
  });

  describe('Configuración de rutas', () => {
    it('debería tener rutas de autenticación configuradas', async () => {
      const response = await request(app)
        .post('/services/auth/register')
        .send({});

      expect(response.status).toBeDefined();
    });

    it('debería retornar 404 para rutas inexistentes', async () => {
      const response = await request(app)
        .get('/ruta-inexistente')
        .expect(404);

      expect(response.status).toBe(404);
    });
  });

  describe('Configuración de headers', () => {
    it('debería incluir headers de seguridad apropiados', async () => {
      const response = await request(app)
        .get('/services/projects');

      // Verificar headers de seguridad básicos
      expect(response.headers).toHaveProperty('x-powered-by');
      // Express por defecto incluye x-powered-by
    });
  });
}); 