const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

// Mock de jsonwebtoken para el middleware
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn((token, secret, callback) => {
    callback(null, { id: 1, email: 'ana.lopez@mail.com', is_admin: true });
  })
}));

// Mock de la base de datos
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  rowCount: 1
}));

const pool = require('../src/config/db');

describe('User Role Assignment Tests (ROLE1)', () => {
  let authToken;

  beforeEach(() => {
    jest.clearAllMocks();
    pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
    
    // Token de administrador (ana.lopez@mail.com)
    authToken = jwt.sign(
      { id: 1, email: 'ana.lopez@mail.com', is_admin: true },
      'tu_secreto_super_seguro'
    );
  });

  describe('Asignación de Roles', () => {
    it('debería completar el flujo completo de asignación de rol', async () => {
      // Mock de las respuestas de base de datos en orden
      const mockResponses = [
        { rows: [{ id: 3, nombre: 'Luis Ramírez' }], rowCount: 1 }, // Verifica usuario
        { rows: [{ id: 2, nombre: 'Supervisor' }], rowCount: 1 }, // Verifica rol
        { rows: [], rowCount: 0 }, // Verifica si ya tiene el rol
        { rows: [{ usuario_id: 3, rol_id: 2 }], rowCount: 1 } // Inserta relación
      ];

      let mockIndex = 0;
      pool.query.mockImplementation(() => {
        const response = mockResponses[mockIndex];
        mockIndex++;
        return Promise.resolve(response);
      });

      // 2. Realizar asignación de rol - Usando cookie en lugar de Bearer token
      const response = await request(app)
        .post('/services/register-user-rol')
        .set('Cookie', [`token=${authToken}`]) // Usando cookie para el token
        .send({
          usuario_id: 3, // Luis Ramírez
          roles: [2] // Supervisor
        });

      // 3. Verificar respuesta HTTP
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Roles asignados correctamente al usuario.');

      // 4. Verificar las llamadas a la base de datos
      expect(pool.query).toHaveBeenCalledTimes(4); // Usuario, Rol, Existe, Insertar

      // Verificar la llamada para buscar el usuario
      expect(pool.query).toHaveBeenNthCalledWith(1, 
        'SELECT * FROM usuarios WHERE id = $1', 
        [3]
      );

      // Verificar la llamada para buscar el rol
      expect(pool.query).toHaveBeenNthCalledWith(2,
        'SELECT * FROM roles WHERE id = $1',
        [2]
      );

      // Verificar la llamada para comprobar si existe la relación
      expect(pool.query).toHaveBeenNthCalledWith(3,
        'SELECT * FROM usuarios_roles WHERE usuario_id = $1 AND rol_id = $2',
        [3, 2]
      );

      // Verificar la llamada para insertar la relación
      expect(pool.query).toHaveBeenNthCalledWith(4,
        'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES ($1, $2)',
        [3, 2]
      );
    });
  });
});
