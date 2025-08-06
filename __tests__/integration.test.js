// __tests__/integration.test.js

const request = require('supertest');

// NO importamos la app directamente. Apuntaremos a la URL del servidor en Docker.
// const app = require('../src/app'); 
// const pool = require('../src/config/db');

// La URL donde tu backend está expuesto por Docker.
const API_URL = 'http://localhost:4000';


describe('Prueba de Integración: Gestión de Proyectos según Rol (PROJ1)', () => {
    // Usamos un 'agent' para que las cookies se mantengan entre peticiones.
    // Le pasamos la URL del servidor en lugar del objeto 'app'.
    const agent = request.agent(API_URL);
    const testTimeout = 15000;

    // **¡IMPORTANTE!** Asegúrate que 'admin' es la contraseña correcta para este usuario.
    const adminCredentials = {
        email: 'admin@ejemplo.com',
        password: 'admin'
    };

    // Antes de todas las pruebas, nos autenticamos para establecer la cookie de sesión
    beforeAll(async () => {
        const response = await agent // Usamos el agent para la petición
            .post('/services/auth/login')
            .send(adminCredentials);

        if (response.statusCode !== 200) {
            // Si esto falla ahora, el error SÍ aparecerá en los logs de Docker.
            console.error('Error al iniciar sesión como admin:', response.body);
        }
        
        // Verificamos que el login fue exitoso.
        expect(response.statusCode).toBe(200);

    }, testTimeout);


    // Caso de prueba para el Administrador
    it('Admin debe poder acceder a la lista de proyectos usando la cookie de sesión', async () => {
        const startTime = Date.now();
        
        // Usamos el agent de nuevo. Automáticamente enviará la cookie de sesión.
        const response = await agent
            .get('/services/projects')
            .expect(200);

        const responseTime = Date.now() - startTime;

        // Las verificaciones de los datos del proyecto siguen siendo las mismas
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(4);
        const projectNames = response.body.map(p => p.nombre);
        expect(projectNames).toEqual(
            expect.arrayContaining(['La Estacion', 'Metroplaza', 'Megacentro', 'Interplaza'])
        );
        expect(responseTime).toBeLessThan(1000);
        console.log(`Tiempo de respuesta para Admin: ${responseTime}ms`);
    });

    // Ya no podemos cerrar el pool de la base de datos desde aquí,
    // lo cual está bien para un entorno de pruebas.
});
