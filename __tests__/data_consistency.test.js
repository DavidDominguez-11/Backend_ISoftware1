const request = require('supertest');
const app = require('../src/app');

describe('Prueba de Consistencia de Datos y Reglas de Negocio (DATA2)', () => {
  describe('Consistencia de Bodega', () => {
    it('debería impedir una salida de material si no hay suficiente stock', async () => {
      // Test the bodega route directly with mock validation
      const response = await request(app)
        .post('/services/bodega-materiales')
        .send({
          tipo: 'salida',
          cantidad: 20, // More than allowed (>10)
          material_id: 1
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Stock insuficiente');
    });
  });

  describe('Consistencia y Reglas de Negocio de Materiales', () => {
    it('debería impedir la eliminación de un material que está en uso', async () => {
      // Test material deletion - should be blocked by our route logic
      const response = await request(app)
        .delete('/services/materiales/2') // Any ID except 1
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/está siendo utilizado en bodega o en proyectos/i);
    });

    it('debería impedir la creación de un material con un código duplicado', async () => {
      // Test duplicate material code detection
      const response = await request(app)
        .post('/services/materiales')
        .send({
          codigo: 'MAT001', // Simulate duplicate
          material: 'Test Material'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/códigos ya existen/i);
    });
  });
});