// load-tests/scenarios/stress.js
import { authenticate } from '../scripts/auth.js';
import { getProjects } from '../scripts/projects.js';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Rampa rápida a 100 usuarios
    { duration: '2m', target: 100 },   // Mantener 100 usuarios
    { duration: '30s', target: 200 },  // Subir a 200 usuarios
    { duration: '2m', target: 200 },   // Mantener 200 usuarios
    { duration: '30s', target: 0 },    // Bajar a 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Umbral más alto para estrés
    http_req_failed: ['rate<0.2'],     // Umbral más alto para fallos
  },
};

export default function () {
  let token = authenticate();
  
  if (!token) {
    errorRate.add(1);
    return;
  }

  // En estrés, solo hacemos operaciones de lectura
  const res = getProjects(token);
  if (res.status !== 200) {
    errorRate.add(1);
  }

  // Pequeña pausa aleatoria
  sleep(Math.random() * 2);
}