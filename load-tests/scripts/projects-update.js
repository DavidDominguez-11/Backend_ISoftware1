// load-tests/scripts/projects-update.js
import { BASE_URL, endpoints, projectUpdateData, defaultHeaders, replaceEndpointId } from '../config/config.js';
import { check, sleep } from 'k6';
import http from 'k6/http';

const params = {
  headers: defaultHeaders,
};

export function updateProjectById(projectId, updateData = null) {
  if (!projectId) {
    console.log('No project ID provided for updateProjectById');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.updateProject, projectId)}`;
  const dataToSend = updateData || {
    ...projectUpdateData,
    nombre: `Proyecto Actualizado ${Math.floor(Math.random() * 10000)}`,
    presupuesto: Math.floor(Math.random() * 100000) + 50000,
  };
  
  const payload = JSON.stringify(dataToSend);
  const res = http.put(url, payload, params);
  
  check(res, {
    'update project response': (r) => r.status === 200 || r.status === 400 || r.status === 404,
  });

  return res;
}

export function updateProjectStatus(projectId, newStatus = null) {
  if (!projectId) {
    console.log('No project ID provided for updateProjectStatus');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.updateProjectStatus, projectId)}`;
  const status = newStatus || ['solicitado', 'en progreso', 'finalizado', 'cancelado'][Math.floor(Math.random() * 4)];
  
  const payload = JSON.stringify({ estado: status });
  const res = http.patch(url, payload, params);
  
  check(res, {
    'update project status response': (r) => r.status === 200 || r.status === 400 || r.status === 404,
  });

  return res;
}

export function updateProjectType(projectId, newType = null) {
  if (!projectId) {
    console.log('No project ID provided for updateProjectType');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.updateProjectType, projectId)}`;
  const type = newType || ['regulares', 'irregulares', 'remodelaciones', 'jacuzzis', 'paneles solares', 'fuentes y cascadas'][Math.floor(Math.random() * 6)];
  
  const payload = JSON.stringify({ tipo_servicio: type });
  const res = http.patch(url, payload, params);
  
  check(res, {
    'update project type response': (r) => r.status === 200 || r.status === 400 || r.status === 404,
  });

  return res;
}