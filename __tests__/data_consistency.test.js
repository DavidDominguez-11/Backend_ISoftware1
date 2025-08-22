const request = require('supertest');

// La URL donde tu backend está expuesto por Docker.
const API_URL = 'http://localhost:4000'; // Asegúrate que el puerto es el correcto.

describe('Prueba de Consistencia de Datos y Reglas de Negocio (DATA2)', () => {
    // Usamos un 'agent' para mantener la sesión (cookies) entre peticiones.
    const agent = request.agent(API_URL);
    const testTimeout = 20000; // Aumentamos el timeout por si las operaciones de BD son lentas.

    // Credenciales para autenticarse antes de las pruebas.
    const adminCredentials = {
        email: 'admin@ejemplo.com',
        password: 'admin' // ¡Asegúrate que esta es la contraseña correcta!
    };

    // Antes de todas las pruebas de este bloque, nos autenticamos como admin.
    beforeAll(async () => {
        const response = await agent
            .post('/services/auth/login')
            .send(adminCredentials);
        
        // Si el login falla, las demás pruebas no tienen sentido.
        if (response.statusCode !== 200) {
            console.error('Error fatal: El inicio de sesión para las pruebas falló.', response.body);
        }
        expect(response.statusCode).toBe(200);

    }, testTimeout);


    // ----------------------------------------------------------------------------------
    // PRUEBA 1.2.3: Movimientos de bodega inválidos
    // ----------------------------------------------------------------------------------
    describe('Consistencia de Bodega', () => {
        it('debería impedir una salida de material si no hay suficiente stock', async () => {
            // --- ARRANGE (Preparar el escenario) ---

            // 1. Crear un material nuevo y único para esta prueba, para no depender de datos existentes.
            const nuevoMaterial = {
                materiales: [{
                    codigo: `TEST-STOCK-${Date.now()}`,
                    material: 'Material de Prueba de Stock'
                }]
            };
            const resCrear = await agent.post('/services/materiales').send(nuevoMaterial);
            expect(resCrear.statusCode).toBe(201);
            const materialCreado = resCrear.body.materiales[0];

            // 2. Registrar una ENTRADA inicial de 10 unidades para este material.
            const movimientoEntrada = {
                material_id: materialCreado.id,
                tipo: 'entrada',
                cantidad: 10,
                fecha: new Date().toISOString().split('T')[0], // Fecha de hoy en formato YYYY-MM-DD
                observaciones: 'Stock inicial para prueba'
            };
            const resEntrada = await agent.post('/services/bodega-materiales').send(movimientoEntrada);
            expect(resEntrada.statusCode).toBe(201);

            // --- ACT (Ejecutar la acción a probar) ---

            // 3. Intentar registrar una SALIDA de 15 unidades (más de las que hay).
            const movimientoSalidaInvalido = {
                material_id: materialCreado.id,
                tipo: 'salida',
                cantidad: 15, // > 10 que hay en stock
                fecha: new Date().toISOString().split('T')[0],
                observaciones: 'Intento de salida sin stock suficiente'
            };
            const resSalida = await agent.post('/services/bodega-materiales').send(movimientoSalidaInvalido);

            // --- ASSERT (Verificar el resultado) ---

            // 4. El sistema DEBERÍA rechazar la operación con un error 400 (Bad Request).
            // NOTA: Esta prueba fallará si la lógica del backend no valida el stock.
            expect(resSalida.statusCode).toBe(400);
            expect(resSalida.body.message).toMatch(/stock insuficiente/i); // Esperamos un mensaje de error claro.
        });
    });
});

// ----------------------------------------------------------------------------------
// PRUEBAS ADICIONALES: Lógica de Negocio en Materiales
// ----------------------------------------------------------------------------------
describe('Prueba de Consistencia de Datos y Reglas de Negocio (DATA2)', () => {

    // ✅ Agent se define aquí para que TODOS los 'describe' anidados lo puedan usar.
    const agent = request.agent(API_URL);
    const testTimeout = 20000;

    // ✅ El login se ejecuta UNA SOLA VEZ antes de todas las pruebas en este archivo.
    beforeAll(async () => {
        const adminCredentials = {
            email: 'admin@ejemplo.com',
            password: 'admin' // ¡Asegúrate que esta es la contraseña correcta!
        };
        const response = await agent
            .post('/services/auth/login')
            .send(adminCredentials);
        
        // Si el login falla, las demás pruebas no tienen sentido.
        if (response.statusCode !== 200) {
            console.error('Error fatal: El inicio de sesión para las pruebas falló.', response.body);
        }
        expect(response.statusCode).toBe(200);

    }, testTimeout);


    // ----------------------------------------------------------------------------------
    // SUITE 1: Consistencia de Bodega
    // ----------------------------------------------------------------------------------
    describe('Consistencia de Bodega', () => {
        it('debería impedir una salida de material si no hay suficiente stock', async () => {
            // --- ARRANGE (Preparar el escenario) ---
            const nuevoMaterial = {
                materiales: [{
                    codigo: `TEST-STOCK-${Date.now()}`,
                    material: 'Material de Prueba de Stock'
                }]
            };
            const resCrear = await agent.post('/services/materiales').send(nuevoMaterial);
            expect(resCrear.statusCode).toBe(201);
            const materialCreado = resCrear.body.materiales[0];

            // --- Registrar una ENTRADA inicial ---
            const movimientoEntrada = {
                material_id: materialCreado.id,
                tipo: 'entrada',
                cantidad: 10,
                fecha: new Date().toISOString().split('T')[0], // Fecha de hoy en formato YYYY-MM-DD
                observaciones: 'Stock inicial para prueba'
            };
            const resEntrada = await agent.post('/services/bodega-materiales').send(movimientoEntrada);
            expect(resEntrada.statusCode).toBe(201);

            // --- ACT (Ejecutar la acción a probar) ---
            const movimientoSalidaInvalido = {
                material_id: materialCreado.id,
                tipo: 'salida',
                cantidad: 15, // > 10 que hay en stock
                fecha: new Date().toISOString().split('T')[0],
                observaciones: 'Intento de salida sin stock suficiente'
            };
            const resSalida = await agent.post('/services/bodega-materiales').send(movimientoSalidaInvalido);

            // --- ASSERT (Verificar el resultado) ---
            expect(resSalida.statusCode).toBe(400);
            expect(resSalida.body.message).toMatch(/stock insuficiente/i); // Esperamos un mensaje de error claro.
        });
    });


    // ----------------------------------------------------------------------------------
    // SUITE 2: Consistencia y Reglas de Negocio de Materiales (ESTE BLOQUE SE MOVIÓ AQUÍ)
    // ----------------------------------------------------------------------------------
    describe('Consistencia y Reglas de Negocio de Materiales', () => {

        /**
         * Prueba la lógica del controlador `deleteMaterial`.
         * REGLA: No se puede eliminar un material si ya tiene movimientos en bodega.
         */
        it('debería impedir la eliminación de un material que está en uso', async () => {
            // --- ARRANGE (Preparar el escenario) ---
            const nuevoMaterial = {
                materiales: [{
                    codigo: `TEST-DEL-${Date.now()}`,
                    material: 'Material de Prueba para Borrado'
                }]
            };
            const resCrear = await agent.post('/services/materiales').send(nuevoMaterial);
            expect(resCrear.statusCode).toBe(201);
            const materialCreado = resCrear.body.materiales[0];

            // --- Crear una referencia en bodega ---
            const movimientoEntrada = {
                material_id: materialCreado.id,
                tipo: 'entrada',
                cantidad: 5,
                fecha: new Date().toISOString().split('T')[0]
            };
            const resEntrada = await agent.post('/services/bodega-materiales').send(movimientoEntrada);
            expect(resEntrada.statusCode).toBe(201);

            // --- ACT (Ejecutar la acción a probar) ---
            const resDelete = await agent.delete(`/services/materiales/${materialCreado.id}`);

            // --- ASSERT (Verificar el resultado) ---
            expect(resDelete.statusCode).toBe(400);
            expect(resDelete.body.message).toMatch(/está siendo utilizado en bodega o en proyectos/i);
        });

        /**
         * Prueba la lógica del controlador `createMateriales`.
         * REGLA: No se puede crear un material con un 'codigo' que ya existe.
         */
        it('debería impedir la creación de un material con un código duplicado', async () => {
            // --- ARRANGE (Preparar el escenario) ---
            const codigoDuplicado = `TEST-DUP-${Date.now()}`;
            const materialUnico = {
                materiales: [{
                    codigo: codigoDuplicado,
                    material: 'Material con Código Único'
                }]
            };

            // --- Crear el material por primera vez ---
            const resPrimeraVez = await agent.post('/services/materiales').send(materialUnico);
            expect(resPrimeraVez.statusCode).toBe(201);

            // --- ACT (Ejecutar la acción a probar) ---
            const materialRepetido = {
                materiales: [{
                    codigo: codigoDuplicado,
                    material: 'Intentando duplicar código'
                }]
            };
            const resSegundaVez = await agent.post('/services/materiales').send(materialRepetido);

            // --- ASSERT (Verificar el resultado) ---
            expect(resSegundaVez.statusCode).toBe(400);
            expect(resSegundaVez.body.message).toMatch(/códigos ya existen/i);
        });
    });

});