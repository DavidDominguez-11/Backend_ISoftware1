// load-tests/scenarios/load.js
import { authenticate } from '../scripts/auth.js';
import { getProjects, createProject } from '../scripts/projects.js';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Rampa hasta 20 usuarios en 30 segundos
    { duration: '1m', target: 20 },   // Mantener 20 usuarios por 1 minuto
    { duration: '30s', target: 50 },  // Subir a 50 usuarios
    { duration: '1m', target: 50 },   // Mantener 50 usuarios
    { duration: '30s', target: 0 },   // Bajar a 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de las peticiones deben ser más rápidas que 500ms
    http_req_failed: ['rate<0.1'],    // Menos del 10% de peticiones fallidas
    errors: ['rate<0.1'],             // Menos del 10% de errores
  },
};

export default function () {
  let token = authenticate();
  
  if (!token) {
    errorRate.add(1);
    return;
  }

  // Ejecutar operaciones de proyecto
  let res = getProjects(token);
  if (res.status !== 200) {
    errorRate.add(1);
  }

  // Pequeña pausa entre operaciones
  sleep(1);

  // Crear un nuevo proyecto (solo el 30% de las veces)
  if (Math.random() < 0.3) {
    res = createProject(token);
    if (res.status !== 201) {
      errorRate.add(1);
    }
  }
}