// __tests__/integration.test.js

const request = require('supertest');
const app = require('../src/app');

describe('Prueba de Integración: Gestión de Proyectos según Rol (PROJ1)', () => {
    it('Admin debe poder acceder a la lista de proyectos usando la cookie de sesión', async () => {
        // Test admin access to projects with cookie
        const response = await request(app)
            .get('/services/projects')
            .set('Cookie', ['token=admin_token'])
            .expect(200);

        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
});
