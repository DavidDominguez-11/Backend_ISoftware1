// load-tests/config/config.js
export const BASE_URL = 'http://localhost:3000'; // Ajusta según tu configuración

export const endpoints = {
  login: '/api/auth/login',
  projects: '/api/projects',
  // Agrega más endpoints según sea necesario
};

export const users = [
  { username: 'usuario1@ejemplo.com', password: 'password123' },
  // Agrega más usuarios de prueba
];

export const projectData = {
  // Datos de ejemplo para crear un proyecto
  name: 'Proyecto de prueba',
  description: 'Descripción del proyecto',
  // Ajusta según tu modelo de datos
};