// load-tests/scenarios/stress.js
import { authenticate } from '../scripts/auth.js';
import { 
  getProjects, 
  getFinishedProjectsCount, 
  getInProgressProjectsCount,
  getTotalProjectsByService,
  getProjectMaterials,
  getRandomExistingProject,
  getProjectById
} from '../scripts/projects.js';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const authFailureRate = new Rate('auth_failures');
export const responseTime = new Trend('stress_response_time');
export const operationsCounter = new Counter('total_operations');

export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Rampa rápida a 100 usuarios
    { duration: '2m', target: 100 },   // Mantener 100 usuarios
    { duration: '30s', target: 200 },  // Subir a 200 usuarios
    { duration: '2m', target: 200 },   // Mantener 200 usuarios
    { duration: '1m', target: 300 },   // Pico de estrés: 300 usuarios
    { duration: '1m', target: 300 },   // Mantener pico
    { duration: '30s', target: 0 },    // Bajar a 0 usuarios
  ],
  thresholds: {
    http_req_duration: ['p(95)<6000'],     // Umbral más alto para estrés: 6s
    http_req_failed: ['rate<0.2'],         // Umbral más alto para fallos: 20%
    errors: ['rate<0.15'],                 // Hasta 15% de errores en estrés
    auth_failures: ['rate<0.05'],          // Hasta 5% de fallos de auth en estrés
    stress_response_time: ['p(99)<8000'],  // 99% de respuestas < 8s en estrés
  },
};

export default function () {
  const startTime = Date.now();
  
  // Intentar autenticación
  const userData = authenticate();
  operationsCounter.add(1);
  
  if (!userData) {
    console.log('Authentication failed in stress test');
    errorRate.add(1);
    authFailureRate.add(1);
    return;
  }

  // En estrés, focus en operaciones de lectura principalmente
  try {
    // Operación principal: obtener proyectos (siempre)
    const projectsRes = getProjects();
    operationsCounter.add(1);
    
    if (projectsRes.status !== 200) {
      errorRate.add(1);
    }

    // Pausa muy corta en estrés
    sleep(Math.random() * 0.5);

    // Operaciones estadísticas rápidas (70% probabilidad - más frecuente en estrés)
    if (Math.random() < 0.7) {
      const operations = [
        () => getFinishedProjectsCount(),
        () => getInProgressProjectsCount(),
        () => getTotalProjectsByService()
      ];

      // Ejecutar 1-2 operaciones aleatorias
      const numOps = Math.random() < 0.6 ? 1 : 2;
      for (let i = 0; i < numOps; i++) {
        const randomOp = operations[Math.floor(Math.random() * operations.length)];
        const res = randomOp();
        operationsCounter.add(1);
        
        if (res && res.status >= 400 && res.status !== 404) {
          errorRate.add(1);
        }
        
        // Pausa muy corta entre operaciones
        sleep(Math.random() * 0.2);
      }
    }

    // Operaciones de detalle (40% probabilidad)
    if (Math.random() < 0.4) {
      // Obtener materiales de proyectos
      const materialsRes = getProjectMaterials();
      operationsCounter.add(1);
      
      if (materialsRes && materialsRes.status >= 400 && materialsRes.status !== 404) {
        errorRate.add(1);
      }

      sleep(Math.random() * 0.3);

      // Ver detalle de un proyecto específico
      const project = getRandomExistingProject();
      if (project && project.id) {
        const projectRes = getProjectById(project.id);
        operationsCounter.add(1);
        
        if (projectRes && projectRes.status >= 400 && projectRes.status !== 404) {
          errorRate.add(1);
        }
      }
    }

  } catch (error) {
    console.log(`Error in stress test execution: ${error.message}`);
    errorRate.add(1);
  }

  // Registrar tiempo de respuesta
  const endTime = Date.now();
  responseTime.add(endTime - startTime);

  // Pausa muy corta y aleatoria en pruebas de estrés
  sleep(Math.random() * 1 + 0.1); // Entre 0.1s y 1.1s
}