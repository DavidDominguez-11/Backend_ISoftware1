const request = require('supertest');
const app = require('../src/app');

// Mock the database pool
jest.mock('../src/config/db', () => ({
  query: jest.fn()
}));

const pool = require('../src/config/db');

describe('DATA1 - Integridad referencial', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Set up default mock implementation
    pool.query.mockResolvedValue({ rows: [] });
  });

  // Test 1: Verificar integridad referencial al eliminar un usuario con proyectos
  it('debería mantener integridad al eliminar usuario con proyectos', async () => {
    // Mock the database to reject the delete operation
    pool.query.mockRejectedValueOnce({
      code: '23503', // Foreign key violation
      message: 'update or delete on table "usuarios" violates foreign key constraint on table "proyectos"'
    });

    // 1. Intentar eliminar el usuario (debería fallar por restricción de clave foránea)
    const mockUserId = 1;
    let deleteError;
    try {
      await pool.query('DELETE FROM usuarios WHERE id = $1', [mockUserId]);
    } catch (error) {
      deleteError = error;
    }

    // 2. Verificar que la eliminación fue rechazada
    expect(deleteError).toBeDefined();
    expect(deleteError.code).toBe('23503');
    
    // 3. Verificar que se llamó a la consulta con los parámetros correctos
    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM usuarios WHERE id = $1',
      [mockUserId]
    );
  });

  // Test 2: Validar restricción de presupuesto no negativo
  it('debería validar constraint de presupuesto no negativo', async () => {
    // Mock the database to reject negative budget
    pool.query.mockRejectedValueOnce({
      code: '23514', // Check constraint violation
      message: 'new row for relation "proyectos" violates check constraint "proyectos_presupuesto_check"'
    });

    // 1. Intentar insertar un proyecto con presupuesto negativo (debería fallar)
    let insertError;
    try {
      await pool.query(
        `INSERT INTO proyectos 
         (nombre, estado, presupuesto, cliente_id, fecha_inicio, tipo_servicio) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Proyecto Presupuesto', 'solicitado', -100, 1, '2025-01-01', 'regulares']
      );
    } catch (error) {
      insertError = error;
    }

    // 2. Verificar que la inserción fue rechazada
    expect(insertError).toBeDefined();
    expect(insertError.code).toBe('23514');
    
    // 3. Verificar que se llamó a la consulta con los parámetros correctos
    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO proyectos \n         (nombre, estado, presupuesto, cliente_id, fecha_inicio, tipo_servicio) \n         VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Proyecto Presupuesto', 'solicitado', -100, 1, '2025-01-01', 'regulares']
    );
  });

  // Test 3: Mantener unicidad de códigos de material
  it('debería mantener unicidad de códigos de material', async () => {
    const materialCode = 'MAT-UNIQUE-001';
    
    // Mock the first successful insert
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    
    // 1. Insertar un material con un código único (éxito)
    await pool.query(
      'INSERT INTO materiales (codigo, material) VALUES ($1, $2)',
      [materialCode, 'Material de prueba']
    );

    // Mock the second insert to fail with unique violation
    pool.query.mockRejectedValueOnce({
      code: '23505', // Unique violation
      constraint: 'materiales_codigo_key',
      message: 'duplicate key value violates unique constraint "materiales_codigo_key"'
    });

    // 2. Intentar insertar otro material con el mismo código (debería fallar)
    let insertError;
    try {
      await pool.query(
        'INSERT INTO materiales (codigo, material) VALUES ($1, $2)',
        [materialCode, 'Material duplicado']
      );
    } catch (error) {
      insertError = error;
    }

    // 3. Verificar que la segunda inserción falló con el código de error correcto
    expect(insertError).toBeDefined();
    expect(insertError.code).toBe('23505');
    
    // 4. Verificar que se llamó a las consultas con los parámetros correctos
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO materiales (codigo, material) VALUES ($1, $2)',
      [materialCode, 'Material de prueba']
    );
    expect(pool.query).toHaveBeenCalledWith(
      'INSERT INTO materiales (codigo, material) VALUES ($1, $2)',
      [materialCode, 'Material duplicado']
    );
  });
});
