// __tests__/security/sql_injection.test.js

const request = require('supertest');

// Mock de la base de datos para evitar ejecuciones reales
jest.mock('../../src/config/db', () => ({
  query: jest.fn(),
}));

const app = require('../../src/app');

// Cargar el mock del pool después de requerir app
const pool = require('../../src/config/db');

describe('SECURITY - SQL Injection attempts should be rejected', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /services/projects/projectById/:id', () => {
    it('debería rechazar ID con inyección: "1 OR 1=1" (400)', async () => {
      const payload = '1 OR 1=1';
      const res = await request(app)
        .get(`/services/projects/projectById/${encodeURIComponent(payload)}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      // Debe validar el ID y NO ejecutar consulta a la BD
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('debería rechazar ID con terminador y comentario: "1; DROP TABLE proyectos; --" (400)', async () => {
      const payload = '1; DROP TABLE proyectos; --';
      const res = await request(app)
        .get(`/services/projects/projectById/${encodeURIComponent(payload)}`);

      expect(res.status).toBe(400);
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /services/projects/:id/estado', () => {
    it('debería rechazar estado con payload malicioso (400)', async () => {
      // El enum del controlador debe prevenir valores inválidos
      const maliciousEstado = "finalizado'; DROP TABLE usuarios; --";

      const res = await request(app)
        .patch('/services/projects/1/estado')
        .send({ estado: maliciousEstado })
        .set('Content-Type', 'application/json');

      expect([400, 422]).toContain(res.status);
      // En caso ideal, no debería llegar a ejecutar query
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /services/projects/:id/tipo', () => {
    it('debería rechazar tipo_servicio con payload malicioso (400)', async () => {
      const maliciousTipo = "regulares'; DROP TABLE proyectos; --";

      const res = await request(app)
        .patch('/services/projects/1/tipo')
        .send({ tipo_servicio: maliciousTipo })
        .set('Content-Type', 'application/json');

      expect([400, 422]).toContain(res.status);
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('POST /services/projects/create', () => {
    it('debería manejar strings maliciosos como datos literales y no ejecutar SQL inseguro', async () => {
      // Esta prueba valida que los campos sean tratados como parámetros
      // y no provoquen errores de sintaxis SQL por inyección.
      // Dependiendo de la validación, puede devolver 201 (creado) o 400 (validación fallida),
      // pero nunca 500 por error SQL.
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 999, nombre: "Seguro'; DROP TABLE x; --", estado: 'solicitado' }],
        rowCount: 1,
      });

      const res = await request(app)
        .post('/services/projects/create')
        .send({
          nombre: "Seguro'; DROP TABLE x; --",
          estado: 'solicitado',
          presupuesto: 1000,
          cliente_id: 1,
          fecha_inicio: '2025-01-01',
          tipo_servicio: 'regulares'
        })
        .set('Content-Type', 'application/json');

      expect([201, 400]).toContain(res.status);
      // Si fue 201, significa que el valor fue tratado como literal seguro.
      // Nunca debería ser 500 por error de sintaxis.
      expect(res.status).not.toBe(500);
    });
  });
});
