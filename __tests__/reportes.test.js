const request = require('supertest');
const app = require('../src/app');

// Mock Prisma for reports tests
jest.mock('../src/prismaClient', () => ({
  bodega_materiales: {
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn()
  },
  proyectos: {
    findMany: jest.fn(),
    count: jest.fn()
  },
  materiales: {
    findMany: jest.fn()
  },
  clientes: {
    findMany: jest.fn()
  },
  proyecto_material: {
    aggregate: jest.fn()
  }
}));

const prisma = require('../src/prismaClient');

describe('REPORTES - Endpoints de reportes con filtros avanzados', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /services/reportes/materiales', () => {
    it('debería obtener reporte de materiales sin filtros', async () => {
      // Mock data
      const mockMovimientos = [
        {
          id: 1,
          fecha: '2024-01-15',
          tipo: 'entrada',
          cantidad: 50,
          material_id: 1,
          proyecto_id: null,
          material: { codigo: 'MAT001', material: 'Cemento' },
          proyecto: null
        },
        {
          id: 2,
          fecha: '2024-01-16',
          tipo: 'salida',
          cantidad: -10,
          material_id: 1,
          proyecto_id: 1,
          material: { codigo: 'MAT001', material: 'Cemento' },
          proyecto: { nombre: 'Proyecto A' }
        }
      ];

      prisma.bodega_materiales.count.mockResolvedValue(2);
      prisma.bodega_materiales.findMany.mockResolvedValue(mockMovimientos);
      prisma.bodega_materiales.aggregate.mockResolvedValue({ _sum: { cantidad: 40 } });
      prisma.proyecto_material.aggregate.mockResolvedValue({ _sum: { ofertada: 10 } });

      const response = await request(app)
        .get('/services/reportes/materiales')
        .expect(200);

      expect(response.body).toHaveProperty('filtros_aplicados');
      expect(response.body).toHaveProperty('paginacion');
      expect(response.body).toHaveProperty('estadisticas');
      expect(response.body).toHaveProperty('datos');
      expect(response.body.datos).toHaveLength(2);
      expect(response.body.paginacion.total_registros).toBe(2);
    });

    it('debería aplicar filtros de fecha correctamente', async () => {
      prisma.bodega_materiales.count.mockResolvedValue(1);
      prisma.bodega_materiales.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/services/reportes/materiales')
        .query({
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-01-31',
          tipo_movimiento: 'entrada'
        })
        .expect(200);

      expect(response.body.filtros_aplicados.fecha_inicio).toBe('2024-01-01');
      expect(response.body.filtros_aplicados.fecha_fin).toBe('2024-01-31');
      expect(response.body.filtros_aplicados.tipo_movimiento).toBe('entrada');
    });

    it('debería rechazar parámetros inválidos', async () => {
      const response = await request(app)
        .get('/services/reportes/materiales')
        .query({
          fecha_inicio: 'invalid-date',
          material_ids: 'not-a-number',
          limit: '2000'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('debería aplicar paginación correctamente', async () => {
      prisma.bodega_materiales.count.mockResolvedValue(100);
      prisma.bodega_materiales.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/services/reportes/materiales')
        .query({
          limit: '20',
          offset: '40'
        })
        .expect(200);

      expect(response.body.paginacion.limite_por_pagina).toBe(20);
      expect(response.body.paginacion.offset).toBe(40);
      expect(response.body.paginacion.pagina_actual).toBe(3);
      expect(response.body.paginacion.total_paginas).toBe(5);
    });
  });

  describe('GET /services/reportes/proyectos', () => {
    it('debería obtener reporte de proyectos sin filtros', async () => {
      const mockProyectos = [
        {
          id: 1,
          nombre: 'Proyecto A',
          estado: 'en_progreso',
          tipo_servicio: 'regulares',
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-06-01',
          presupuesto: 100000,
          ubicacion: 'Ubicación A',
          cliente: { nombre: 'Cliente A', telefono: '123456789', email: 'a@test.com' },
          proyecto_material: []
        }
      ];

      prisma.proyectos.count.mockResolvedValue(1);
      prisma.proyectos.findMany.mockResolvedValue(mockProyectos);

      const response = await request(app)
        .get('/services/reportes/proyectos')
        .expect(200);

      expect(response.body).toHaveProperty('filtros_aplicados');
      expect(response.body).toHaveProperty('paginacion');
      expect(response.body).toHaveProperty('estadisticas');
      expect(response.body).toHaveProperty('datos');
      expect(response.body.datos).toHaveLength(1);
      expect(response.body.datos[0]).toHaveProperty('cliente_email');
    });

    it('debería aplicar filtro por estado correctamente', async () => {
      prisma.proyectos.count.mockResolvedValue(0);
      prisma.proyectos.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/services/reportes/proyectos')
        .query({ estado: 'finalizado' })
        .expect(200);

      expect(response.body.filtros_aplicados.estado).toBe('finalizado');
    });

    it('debería rechazar estado inválido', async () => {
      const response = await request(app)
        .get('/services/reportes/proyectos')
        .query({ estado: 'estado_inexistente' })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /services/reportes/stock', () => {
    it('debería obtener reporte de stock sin filtros', async () => {
      const mockMateriales = [
        { id: 1, codigo: 'MAT001', material: 'Cemento' },
        { id: 2, codigo: 'MAT002', material: 'Arena' }
      ];

      prisma.materiales.findMany.mockResolvedValue(mockMateriales);
      prisma.bodega_materiales.aggregate.mockResolvedValue({ _sum: { cantidad: 100 } });
      prisma.proyecto_material.aggregate.mockResolvedValue({ 
        _sum: { ofertada: 20, reservado: 5 } 
      });

      const response = await request(app)
        .get('/services/reportes/stock')
        .expect(200);

      expect(response.body).toHaveProperty('estadisticas');
      expect(response.body).toHaveProperty('datos');
      expect(response.body.estadisticas).toHaveProperty('total_materiales');
      expect(response.body.estadisticas).toHaveProperty('sin_stock');
      expect(response.body.estadisticas).toHaveProperty('stock_bajo');
    });
  });

  describe('GET /services/reportes/filtros', () => {
    it('debería obtener todas las opciones de filtros disponibles', async () => {
      const mockMateriales = [{ id: 1, codigo: 'MAT001', material: 'Cemento' }];
      const mockClientes = [{ id: 1, nombre: 'Cliente A' }];
      const mockProyectos = [{ id: 1, nombre: 'Proyecto A', estado: 'en_progreso' }];

      prisma.materiales.findMany.mockResolvedValue(mockMateriales);
      prisma.clientes.findMany.mockResolvedValue(mockClientes);
      prisma.proyectos.findMany.mockResolvedValue(mockProyectos);

      const response = await request(app)
        .get('/services/reportes/filtros')
        .expect(200);

      expect(response.body).toHaveProperty('materiales');
      expect(response.body).toHaveProperty('clientes');
      expect(response.body).toHaveProperty('proyectos');
      expect(response.body).toHaveProperty('estados_proyecto');
      expect(response.body).toHaveProperty('tipos_servicio');
      expect(response.body).toHaveProperty('tipos_movimiento');
      
      expect(response.body.estados_proyecto).toContain('en_progreso');
      expect(response.body.tipos_servicio).toContain('regulares');
      expect(response.body.tipos_movimiento).toContain('entrada');
    });
  });

  describe('Validaciones de parámetros', () => {
    it('debería validar formato de fechas', async () => {
      const response = await request(app)
        .get('/services/reportes/materiales')
        .query({ fecha_inicio: '2024/01/01' })
        .expect(400);

      expect(response.body.errors).toContain('fecha_inicio debe tener formato YYYY-MM-DD');
    });

    it('debería validar que fecha_inicio no sea mayor que fecha_fin', async () => {
      const response = await request(app)
        .get('/services/reportes/proyectos')
        .query({ 
          fecha_inicio: '2024-12-01',
          fecha_fin: '2024-01-01'
        })
        .expect(400);

      expect(response.body.errors).toContain('fecha_inicio no puede ser mayor que fecha_fin');
    });

    it('debería validar límites de paginación', async () => {
      const response = await request(app)
        .get('/services/reportes/materiales')
        .query({ limit: '2000' })
        .expect(400);

      expect(response.body.errors).toContain('limit debe ser un número entre 1 y 1000');
    });
  });
});