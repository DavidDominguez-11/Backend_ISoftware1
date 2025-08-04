// jest.setup.js

// Variables de entorno para entorno de pruebas local (fuera de Docker)
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';  // accesible desde tu máquina local
process.env.PORT_DB = '5431';       // mapeado por docker-compose
process.env.POSTGRES_USER = 'usuario';
process.env.POSTGRES_PASSWORD = 'secret';
process.env.POSTGRES_DB = 'test_db';

// Silenciar console.log y console.error durante los tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
