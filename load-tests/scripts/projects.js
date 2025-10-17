// load-tests/scripts/projects.js
import { BASE_URL, endpoints, projectData, projectUpdateData, defaultHeaders, replaceEndpointId } from '../config/config.js';
import { check, sleep } from 'k6';
import http from 'k6/http';

const params = {
  headers: defaultHeaders,
};

// Obtener todos los proyectos
export function getProjects() {
  const url = `${BASE_URL}${endpoints.projects}`;
  const res = http.get(url, params);
  
  check(res, {
    'get projects successful': (r) => r.status === 200,
    'get projects has data': (r) => {
      try {
        const data = r.json();
        return Array.isArray(data) && data.length > 0;
      } catch {
        return false;
      }
    },
  });

  return res;
}

// Crear un nuevo proyecto
export function createProject() {
  const url = `${BASE_URL}${endpoints.projectsCreate}`;
  
  // Crear datos dinámicos para cada proyecto
  const dynamicProjectData = {
    ...projectData,
    nombre: `Proyecto Test ${Math.floor(Math.random() * 10000)}`,
    presupuesto: Math.floor(Math.random() * 100000) + 50000,
    cliente_id: Math.floor(Math.random() * 4) + 1,
    tipo_servicio: projectUpdateData.tipos_servicio[Math.floor(Math.random() * projectUpdateData.tipos_servicio.length)]
  };
  
  const payload = JSON.stringify(dynamicProjectData);
  const res = http.post(url, payload, params);
  
  const success = check(res, {
    'create project successful': (r) => r.status === 201,
    'create project returns data': (r) => {
      try {
        const data = r.json();
        return data && data.proyecto && data.proyecto.id;
      } catch {
        return false;
      }
    },
  });

  return { response: res, success };
}

// Obtener proyectos terminados
export function getFinishedProjects() {
  const url = `${BASE_URL}${endpoints.projectsFinished}`;
  const res = http.get(url, params);
  
  check(res, {
    'get finished projects response': (r) => r.status === 200 || r.status === 404,
  });

  return res;
}

// Obtener proyectos en progreso
export function getInProgressProjects() {
  const url = `${BASE_URL}${endpoints.projectsInProgress}`;
  const res = http.get(url, params);
  
  check(res, {
    'get in progress projects response': (r) => r.status === 200 || r.status === 404,
  });

  return res;
}

// Obtener conteo de proyectos terminados
export function getFinishedProjectsCount() {
  const url = `${BASE_URL}${endpoints.projectsFinishedCount}`;
  const res = http.get(url, params);
  
  check(res, {
    'get finished count successful': (r) => r.status === 200,
    'finished count has data': (r) => {
      try {
        const data = r.json();
        return data && typeof data.total_finalizados === 'number';
      } catch {
        return false;
      }
    },
  });

  return res;
}

// Obtener conteo de proyectos en progreso
export function getInProgressProjectsCount() {
  const url = `${BASE_URL}${endpoints.projectsInProgressCount}`;
  const res = http.get(url, params);
  
  check(res, {
    'get in progress count successful': (r) => r.status === 200,
    'in progress count has data': (r) => {
      try {
        const data = r.json();
        return data && typeof data.total === 'number';
      } catch {
        return false;
      }
    },
  });

  return res;
}

// Obtener estadísticas de proyectos por servicio
export function getTotalProjectsByService() {
  const url = `${BASE_URL}${endpoints.projectsTotalByService}`;
  const res = http.get(url, params);
  
  check(res, {
    'get projects by service response': (r) => r.status === 200 || r.status === 404,
  });

  return res;
}

// Obtener estados de proyectos disponibles
export function getProjectStatuses() {
  const url = `${BASE_URL}${endpoints.projectsStatuses}`;
  const res = http.get(url, params);
  
  check(res, {
    'get project statuses successful': (r) => r.status === 200,
    'statuses has valid data': (r) => {
      try {
        const data = r.json();
        return data && Array.isArray(data.estados);
      } catch {
        return false;
      }
    },
  });

  return res;
}

// Obtener materiales de proyectos
export function getProjectMaterials() {
  const url = `${BASE_URL}${endpoints.projectsMaterials}`;
  const res = http.get(url, params);
  
  check(res, {
    'get project materials response': (r) => r.status === 200 || r.status === 404,
  });

  return res;
}

// Obtener proyecto por ID
export function getProjectById(projectId) {
  if (!projectId) {
    console.log('No project ID provided for getProjectById');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.projectById, projectId)}`;
  const res = http.get(url, params);
  
  check(res, {
    'get project by id response': (r) => r.status === 200 || r.status === 404,
  });

  return res;
}

// Actualizar estado de proyecto
export function updateProjectStatus(projectId, newStatus) {
  if (!projectId) {
    console.log('Missing projectId for updateProjectStatus');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.updateProjectStatus, projectId)}`;
  const status = newStatus || projectUpdateData.estados[Math.floor(Math.random() * projectUpdateData.estados.length)];
  const payload = JSON.stringify({ estado: status });
  const res = http.patch(url, payload, params);
  
  check(res, {
    'update project status response': (r) => r.status === 200 || r.status === 400 || r.status === 404,
  });

  return res;
}

// Actualizar tipo de servicio de proyecto
export function updateProjectType(projectId, newType) {
  if (!projectId) {
    console.log('Missing projectId for updateProjectType');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.updateProjectType, projectId)}`;
  const type = newType || projectUpdateData.tipos_servicio[Math.floor(Math.random() * projectUpdateData.tipos_servicio.length)];
  const payload = JSON.stringify({ tipo_servicio: type });
  const res = http.patch(url, payload, params);
  
  check(res, {
    'update project type response': (r) => r.status === 200 || r.status === 400 || r.status === 404,
  });

  return res;
}

// Actualizar proyecto completo por ID
export function updateProjectById(projectId, updateData = null) {
  if (!projectId) {
    console.log('Missing projectId for updateProjectById');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.updateProject, projectId)}`;
  const dataToSend = updateData || {
    nombre: `Proyecto Actualizado ${Math.floor(Math.random() * 10000)}`,
    estado: projectUpdateData.estados[Math.floor(Math.random() * projectUpdateData.estados.length)],
    tipo_servicio: projectUpdateData.tipos_servicio[Math.floor(Math.random() * projectUpdateData.tipos_servicio.length)],
    presupuesto: Math.floor(Math.random() * 100000) + 50000,
    cliente_id: Math.floor(Math.random() * 10) + 1, // Usando el rango correcto según tu DB
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: null,
    ubicacion: 'Zona de Pruebas, Guatemala',
  };
  
  const payload = JSON.stringify(dataToSend);
  const res = http.put(url, payload, params);
  
  check(res, {
    'update project response': (r) => r.status === 200 || r.status === 400 || r.status === 404,
  });

  return res;
}

// Función helper para obtener un proyecto aleatorio existente
export function getRandomExistingProject() {
  const projectsRes = getProjects();
  
  if (projectsRes.status === 200) {
    try {
      const projects = projectsRes.json();
      if (Array.isArray(projects) && projects.length > 0) {
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        return randomProject;
      }
    } catch (error) {
      console.log('Error parsing projects:', error);
    }
  }
  
  return null;
}

// Función para simular un flujo completo de trabajo con proyectos
export function simulateProjectWorkflow() {
  // 1. Obtener lista de proyectos
  getProjects();
  sleep(0.5);

  // 2. Obtener estadísticas (30% de probabilidad)
  if (Math.random() < 0.3) {
    getFinishedProjectsCount();
    sleep(0.3);
    getInProgressProjectsCount();
    sleep(0.3);
  }

  // 3. Ver detalles de un proyecto aleatorio (40% de probabilidad)
  if (Math.random() < 0.4) {
    const project = getRandomExistingProject();
    if (project && project.id) {
      getProjectById(project.id);
      sleep(0.5);
    }
  }

  // 4. Crear nuevo proyecto (20% de probabilidad)
  if (Math.random() < 0.2) {
    createProject();
    sleep(0.5);
  }

  // 5. Actualizar proyecto existente (15% de probabilidad)
  if (Math.random() < 0.15) {
    const project = getRandomExistingProject();
    if (project && project.id) {
      const newStatus = projectUpdateData.estados[Math.floor(Math.random() * projectUpdateData.estados.length)];
      updateProjectStatus(project.id, newStatus);
      sleep(0.3);
    }
  }
}