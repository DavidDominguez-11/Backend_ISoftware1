// Configuración inicial para Jest
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.POSTGRES_USER = 'test_user';
process.env.POSTGRES_PASSWORD = 'test_password';
process.env.POSTGRES_DB = 'test_db';
process.env.PORT_DB = '5432';

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