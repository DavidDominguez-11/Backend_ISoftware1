const request = require('supertest');
const app = require('../src/app');

// Mock de la base de datos
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const pool = require('../src/config/db');

describe('PERF - Pruebas de Rendimiento y Escalabilidad - Materiales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar mock por defecto para evitar errores
    pool.query.mockResolvedValue({ rows: [] });
  });

  describe('PERF1 - Rendimiento de consultas', () => {
    it('debería responder consulta de materiales en menos de 100ms', async () => {
      // Mock de datos de respuesta
      const mockMateriales = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        codigo: `MAT${String(i + 1).padStart(3, '0')}`,
        material: `Material ${i + 1}`
      }));

      pool.query.mockResolvedValue({ rows: mockMateriales });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/services/materiales')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100);
      expect(response.body).toHaveLength(50);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('codigo');
      expect(response.body[0]).toHaveProperty('material');
    });

    it('debería mantener rendimiento con 1000+ materiales', async () => {
      // Generar datos masivos de 1000 materiales
      const mockMaterialesMasivos = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        codigo: `MAT${String(i + 1).padStart(4, '0')}`,
        material: `Material de construcción ${i + 1}`
      }));

      pool.query.mockResolvedValue({ rows: mockMaterialesMasivos });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/services/materiales')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Verificar que el rendimiento no se degrada significativamente
      expect(responseTime).toBeLessThan(200); // Permitimos un poco más de tiempo para 1000 registros
      expect(response.body).toHaveLength(1000);
      expect(response.body[0]).toHaveProperty('codigo');
      expect(response.body[999]).toHaveProperty('codigo', 'MAT1000');
    });

    it('debería optimizar consultas con joins complejos en bodega_materiales', async () => {
      // Simular consulta compleja con join entre materiales y bodega_materiales
      const mockMaterialesConBodega = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        material_id: i + 1,
        material_codigo: `MAT${String(i + 1).padStart(3, '0')}`,
        material_nombre: `Material ${i + 1}`,
        tipo: i % 2 === 0 ? 'entrada' : 'salida',
        cantidad: Math.floor(Math.random() * 100) + 1,
        fecha: '2024-01-01',
        observaciones: `Observación ${i + 1}`
      }));

      pool.query.mockResolvedValue({ rows: mockMaterialesConBodega });

      const startTime = Date.now();
      
      // Llamada a endpoint de bodega que hace join con materiales
      const response = await request(app)
        .get('/services/bodega-materiales')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Verificar que consultas con múltiples joins no exceden tiempos aceptables
      expect(responseTime).toBeLessThan(150);
      expect(response.body).toHaveLength(100);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('material_codigo');
        expect(response.body[0]).toHaveProperty('material_nombre');
      }
    });

    it('debería manejar consulta individual por ID eficientemente', async () => {
      const mockMaterial = {
        id: 1,
        codigo: 'MAT001',
        material: 'Cemento Portland'
      };

      pool.query.mockResolvedValue({ rows: [mockMaterial] });

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/services/materiales/1')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Las consultas por ID deberían ser muy rápidas
      expect(responseTime).toBeLessThan(50);
      expect(response.body).toEqual(mockMaterial);
    });
  });

  describe('PERF2 - Rendimiento de operaciones de escritura', () => {
    it('debería insertar múltiples materiales eficientemente', async () => {
      const materialesParaInsertar = Array.from({ length: 50 }, (_, i) => ({
        codigo: `NEW${String(i + 1).padStart(3, '0')}`,
        material: `Nuevo Material ${i + 1}`
      }));

      const mockInsertedMateriales = materialesParaInsertar.map((mat, i) => ({
        id: i + 1000,
        ...mat
      }));

      // Mock para la verificación de duplicados (ninguno)
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN transaction
        .mockResolvedValueOnce({ rows: [] }) // Check duplicates
        .mockResolvedValueOnce({ rows: mockInsertedMateriales }) // INSERT
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/services/materiales')
        .send({ materiales: materialesParaInsertar })
        .expect(201);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // La inserción de 50 materiales debería ser rápida
      expect(responseTime).toBeLessThan(300);
      expect(response.body.message).toBe('Materiales creados correctamente');
      expect(response.body.materiales).toHaveLength(50);
    });

    it('debería manejar eliminación con verificaciones de integridad rápidamente', async () => {
      // Mock para material existente
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1, codigo: 'MAT001', material: 'Test' }] }) // Check exists
        .mockResolvedValueOnce({ rows: [] }) // Check bodega_materiales
        .mockResolvedValueOnce({ rows: [] }) // Check proyecto_material
        .mockResolvedValueOnce({ rows: [] }); // DELETE

      const startTime = Date.now();
      
      const response = await request(app)
        .delete('/services/materiales/1')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // La eliminación con verificaciones de integridad debería ser rápida
      expect(responseTime).toBeLessThan(100);
      expect(response.body.message).toBe('Material eliminado correctamente');
    });
  });

  describe('PERF3 - Rendimiento bajo carga concurrente', () => {
    it('debería manejar múltiples consultas simultáneas', async () => {
      const mockMateriales = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        codigo: `MAT${String(i + 1).padStart(3, '0')}`,
        material: `Material ${i + 1}`
      }));

      pool.query.mockResolvedValue({ rows: mockMateriales });

      const startTime = Date.now();
      
      // Ejecutar 10 consultas simultáneas
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/services/materiales')
      );

      const responses = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Todas las consultas deberían completarse exitosamente
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(10);
      });

      // El tiempo total para 10 consultas concurrentes no debería ser excesivo
      expect(totalTime).toBeLessThan(500);
    });

    it('debería mantener consistencia en operaciones concurrentes de escritura', async () => {
      // Simular múltiples inserciones concurrentes
      const materialesBatch1 = [
        { codigo: 'CONC001', material: 'Material Concurrente 1' },
        { codigo: 'CONC002', material: 'Material Concurrente 2' }
      ];

      const materialesBatch2 = [
        { codigo: 'CONC003', material: 'Material Concurrente 3' },
        { codigo: 'CONC004', material: 'Material Concurrente 4' }
      ];

      // Mock para cada inserción
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // BEGIN 1
        .mockResolvedValueOnce({ rows: [] }) // Check duplicates 1
        .mockResolvedValueOnce({ rows: materialesBatch1.map((m, i) => ({ id: i + 1, ...m })) }) // INSERT 1
        .mockResolvedValueOnce({ rows: [] }) // COMMIT 1
        .mockResolvedValueOnce({ rows: [] }) // BEGIN 2
        .mockResolvedValueOnce({ rows: [] }) // Check duplicates 2
        .mockResolvedValueOnce({ rows: materialesBatch2.map((m, i) => ({ id: i + 3, ...m })) }) // INSERT 2
        .mockResolvedValueOnce({ rows: [] }); // COMMIT 2

      const startTime = Date.now();
      
      // Ejecutar inserciones concurrentes
      const promises = [
        request(app).post('/services/materiales').send({ materiales: materialesBatch1 }),
        request(app).post('/services/materiales').send({ materiales: materialesBatch2 })
      ];

      const responses = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Ambas inserciones deberían ser exitosas
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Materiales creados correctamente');
      });

      // Las operaciones concurrentes deberían completarse en tiempo razonable
      expect(totalTime).toBeLessThan(400);
    });
  });
});
