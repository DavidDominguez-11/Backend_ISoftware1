// load-tests/scenarios/projects-update-load.js
import { authenticate } from '../scripts/auth.js';
import { getProjects, getProjectById, updateProjectById, updateProjectStatus, updateProjectType, getRandomExistingProject } from '../scripts/projects.js'; // Agregamos updateProjectById a los imports
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const authFailureRate = new Rate('auth_failures');
export const projectUpdateOperationTime = new Trend('project_update_operation_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.05'],
    auth_failures: ['rate<0.02'],
    project_update_operation_duration: ['p(90)<7000'],
  },
};

export default function () {
  const startTime = Date.now();
  
  const userData = authenticate();
  
  if (!userData) {
    console.log('Authentication failed in projects update load test');
    errorRate.add(1);
    authFailureRate.add(1);
    return;
  }

  sleep(Math.random() * 0.5 + 0.2);

  try {
    // Obtener lista de proyectos
    const projectsRes = getProjects();
    if (projectsRes.status !== 200) {
      errorRate.add(1);
    }

    sleep(Math.random() * 0.5);

    // Actualización de proyectos (20% probabilidad)
    if (Math.random() < 0.2) {
      const project = getRandomExistingProject();
      if (project && project.id) {
        // Intentar diferentes tipos de actualizaciones
        const updateType = Math.random();
        
        if (updateType < 0.4) {
          // Actualización completa
          const updateRes = updateProjectById(project.id); // Ahora sí está definida
          if (updateRes && updateRes.status >= 400 && updateRes.status !== 404) {
            errorRate.add(1);
          }
        } else if (updateType < 0.7) {
          // Actualización de estado
          const statusRes = updateProjectStatus(project.id); // Ahora no necesita el segundo parámetro
          if (statusRes && statusRes.status >= 400 && statusRes.status !== 404) {
            errorRate.add(1);
          }
        } else {
          // Actualización de tipo
          const typeRes = updateProjectType(project.id); // Ahora no necesita el segundo parámetro
          if (typeRes && typeRes.status >= 400 && typeRes.status !== 404) {
            errorRate.add(1);
          }
        }
      }
    }

    // Consulta de proyecto específico (30% probabilidad)
    if (Math.random() < 0.3) {
      const project = getRandomExistingProject();
      if (project && project.id) {
        const projectRes = getProjectById(project.id);
        if (projectRes && projectRes.status >= 400 && projectRes.status !== 404) {
          errorRate.add(1);
        }
      }
    }

  } catch (error) {
    console.log(`Error in projects update load test: ${error.message}`);
    errorRate.add(1);
  }

  const endTime = Date.now();
  projectUpdateOperationTime.add(endTime - startTime);

  sleep(Math.random() * 2 + 0.5);
}