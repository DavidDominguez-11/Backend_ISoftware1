const request = require('supertest');
const app = require('../src/app');

// Mock de la base de datos
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const pool = require('../src/config/db');

describe('Projects Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar mock por defecto para evitar errores
    pool.query.mockResolvedValue({ rows: [] });
  });

  describe('GET /services/projects', () => {
    it('debería obtener todos los proyectos exitosamente', async () => {
      const mockProjects = [
        {
          id: 1,
          nombre: 'Proyecto A',
          descripcion: 'Descripción del proyecto A',
          fecha_inicio: '2024-01-01',
          estado: 'activo'
        },
        {
          id: 2,
          nombre: 'Proyecto B',
          descripcion: 'Descripción del proyecto B',
          fecha_inicio: '2024-02-01',
          estado: 'completado'
        }
      ];

      // Mock de la consulta para simular proyectos existentes
      pool.query.mockResolvedValueOnce({
        rows: mockProjects
      });

      const response = await request(app)
        .get('/services/projects')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('nombre');
      expect(response.body[0].nombre).toBe('Proyecto A');
      expect(response.body[1].nombre).toBe('Proyecto B');
    });

    it('debería retornar error 404 cuando no hay proyectos', async () => {
      // Mock de la consulta para simular que no hay proyectos
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/services/projects')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('No se encontraron proyectos');
    });

    it('debería retornar error 500 cuando hay un error en la base de datos', async () => {
      // Mock de la consulta para simular un error en la base de datos
      pool.query.mockRejectedValueOnce(new Error('Error de conexión'));

      const response = await request(app)
        .get('/services/projects')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Error del servidor');
    });
  });
}); 