// load-tests/scenarios/load.js
import { authenticate } from '../scripts/auth.js';
import { 
  getProjects, 
  createProject, 
  simulateProjectWorkflow,
  getFinishedProjectsCount,
  getInProgressProjectsCount 
} from '../scripts/projects.js';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const authFailureRate = new Rate('auth_failures');
export const projectOperationTime = new Trend('project_operation_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Rampa hasta 20 usuarios en 30 segundos
    { duration: '1m', target: 20 },   // Mantener 20 usuarios por 1 minuto
    { duration: '30s', target: 50 },  // Subir a 50 usuarios
    { duration: '1m', target: 50 },   // Mantener 50 usuarios
    { duration: '30s', target: 0 },   // Bajar a 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],    // 95% de las peticiones más rápidas que 1s
    http_req_failed: ['rate<0.1'],        // Menos del 10% de peticiones fallidas
    errors: ['rate<0.05'],                // Menos del 5% de errores de lógica
    auth_failures: ['rate<0.02'],         // Menos del 2% de fallos de autenticación
    project_operation_duration: ['p(90)<800'], // 90% de operaciones de proyecto < 800ms
  },
};

export default function () {
  const startTime = Date.now();
  
  // Intentar autenticación
  const userData = authenticate();
  
  if (!userData) {
    console.log('Authentication failed in load test');
    errorRate.add(1);
    authFailureRate.add(1);
    return;
  }

  // Pequeña pausa después de la autenticación
  sleep(Math.random() * 0.5 + 0.2); // Entre 0.2s y 0.7s

  // Simulación de flujo de trabajo realista
  try {
    // Operaciones principales (siempre se ejecutan)
    const projectsRes = getProjects();
    if (projectsRes.status !== 200) {
      errorRate.add(1);
    }

    sleep(Math.random() * 1 + 0.5); // Entre 0.5s y 1.5s

    // Operaciones estadísticas (50% de probabilidad)
    if (Math.random() < 0.5) {
      const finishedCountRes = getFinishedProjectsCount();
      if (finishedCountRes && finishedCountRes.status !== 200) {
        errorRate.add(1);
      }

      sleep(0.3);

      const inProgressCountRes = getInProgressProjectsCount();
      if (inProgressCountRes && inProgressCountRes.status !== 200) {
        errorRate.add(1);
      }
    }

    sleep(Math.random() * 0.8 + 0.2); // Entre 0.2s y 1s

    // Crear proyecto (30% de probabilidad - simulando que no todos los usuarios crean proyectos)
    if (Math.random() < 0.3) {
      const createRes = createProject();
      if (createRes && createRes.response.status !== 201) {
        errorRate.add(1);
      }
    }

    // Flujo completo adicional (20% de probabilidad)
    if (Math.random() < 0.2) {
      simulateProjectWorkflow();
    }

  } catch (error) {
    console.log(`Error in load test execution: ${error.message}`);
    errorRate.add(1);
  }

  // Registrar tiempo total de operaciones de proyecto
  const endTime = Date.now();
  projectOperationTime.add(endTime - startTime);

  // Pausa final variable para simular tiempo de lectura del usuario
  sleep(Math.random() * 2 + 0.5); // Entre 0.5s y 2.5s
}