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

// Mock de Prisma en lugar de pool.query
jest.mock('../src/prismaClient', () => ({
  usuarios: {
    findUnique: jest.fn()
  },
  roles: {
    findUnique: jest.fn()
  },
  usuarios_roles: {
    findFirst: jest.fn(),
    create: jest.fn()
  }
}));

const prisma = require('../src/prismaClient');

describe('User Role Assignment Tests (ROLE1)', () => {
  let authToken;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock responses for Prisma
    prisma.usuarios.findUnique.mockResolvedValue({ id: 3, nombre: 'Luis Ramírez' });
    prisma.roles.findUnique.mockResolvedValue({ id: 2, nombre: 'Supervisor' });
    prisma.usuarios_roles.findFirst.mockResolvedValue(null); // No existing relationship
    prisma.usuarios_roles.create.mockResolvedValue({ usuario_id: 3, rol_id: 2 });
    
    // Token de administrador (ana.lopez@mail.com)
    authToken = jwt.sign(
      { id: 1, email: 'ana.lopez@mail.com', is_admin: true },
      'tu_secreto_super_seguro'
    );
  });

  describe('Asignación de Roles', () => {
    it('debería completar el flujo completo de asignación de rol', async () => {
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

      // 4. Verificar las llamadas a Prisma
      expect(prisma.usuarios.findUnique).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(prisma.roles.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(prisma.usuarios_roles.findFirst).toHaveBeenCalledWith({
        where: { usuario_id: 3, rol_id: 2 }
      });
      expect(prisma.usuarios_roles.create).toHaveBeenCalledWith({
        data: { usuario_id: 3, rol_id: 2 }
      });
    });
  });
});
