const request = require('supertest');
const app = require('../src/app');

// Mock de Prisma
jest.mock('../src/prismaClient', () => ({
  proyectos: {
    findMany: jest.fn()
  }
}));

const prisma = require('../src/prismaClient');

describe('Projects Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock to prevent errors
    prisma.proyectos.findMany.mockResolvedValue([]);
  });

  describe('GET /services/projects', () => {
    it('debería obtener todos los proyectos exitosamente', async () => {
      const mockProjects = [
        {
          id: 1,
          nombre: 'La Estacion',
          cliente_id: 1,
          estado: 'solicitado',
          fecha_fin: new Date('2025-06-20'),
          fecha_inicio: new Date('2025-05-15'),
          presupuesto: 125000,
          tipo_servicio: 'regulares',
          ubicacion: 'Zona 10, Ciudad de Guatemala',
          cliente: { id: 1, nombre: 'Cliente 1', telefono: '50211111111' }
        },
        {
          id: 2,
          nombre: 'Metroplaza',
          cliente_id: 2,
          estado: 'en_progreso',
          fecha_fin: new Date('2025-06-20'),
          fecha_inicio: new Date('2025-05-15'),
          presupuesto: 125000,
          tipo_servicio: 'irregulares',
          ubicacion: 'Zona 10, Ciudad de Guatemala',
          cliente: { id: 2, nombre: 'Cliente 2', telefono: '50222222222' }
        },
        {
          id: 3,
          nombre: 'Megacentro',
          cliente_id: 3,
          estado: 'cancelado',
          fecha_fin: null,
          fecha_inicio: new Date('2025-05-15'),
          presupuesto: 125000,
          tipo_servicio: 'remodelaciones',
          ubicacion: 'Zona 10, Ciudad de Guatemala',
          cliente: { id: 3, nombre: 'Cliente 3', telefono: '50233333333' }
        },
        {
          id: 4,
          nombre: 'Interplaza',
          cliente_id: 2,
          estado: 'finalizado',
          fecha_fin: new Date('2025-06-20'),
          fecha_inicio: new Date('2025-06-01'),
          presupuesto: 32000,
          tipo_servicio: 'jacuzzis',
          ubicacion: 'Zona 10, Ciudad de Guatemala',
          cliente: { id: 2, nombre: 'Cliente 2', telefono: '50222222222' }
        }
      ];

      // Mock Prisma response
      prisma.proyectos.findMany.mockResolvedValue(mockProjects);

      const response = await request(app)
        .get('/services/projects')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(4);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('nombre');
      expect(response.body[0].nombre).toBe('La Estacion');
      expect(response.body[1].nombre).toBe('Metroplaza');
      expect(response.body[2].nombre).toBe('Megacentro');
      expect(response.body[3].nombre).toBe('Interplaza');
    });

    it('debería retornar error 404 cuando no hay proyectos', async () => {
      // Mock empty array response
      prisma.proyectos.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/services/projects')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('No se encontraron proyectos');
    });

    it('debería retornar error 500 cuando hay un error en la base de datos', async () => {
      // Mock database error
      prisma.proyectos.findMany.mockRejectedValue(new Error('Error de conexión'));

      const response = await request(app)
        .get('/services/projects')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Error del servidor');
    });
  });
}); 