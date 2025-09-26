// load-tests/config/config.js
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export const endpoints = {
  // Auth endpoints
  login: '/services/auth/login',
  register: '/services/auth/register',
  verifyToken: '/services/auth/verify-token',
  logout: '/services/auth/logout',
  
  // Projects endpoints
  projects: '/services/projects',
  projectsCreate: '/services/projects/create',
  projectsFinished: '/services/projects/finished',
  projectsInProgress: '/services/projects/in-progress',
  projectsFinishedCount: '/services/projects/finished/count',
  projectsInProgressCount: '/services/projects/in-progress-count',
  projectsTotalByService: '/services/projects/Total-Projects-ByService',
  projectsStatuses: '/services/projects/status-projects',
  projectsMaterials: '/services/projects/materials',
  
  // Dynamic endpoints (require ID replacement)
  projectById: '/services/projects/projectById/{id}',
  updateProjectStatus: '/services/projects/{id}/estado',
  updateProjectType: '/services/projects/{id}/tipo',
  updateProject: '/services/projects/{id}'
};

export const users = [
  { email: 'admin@ejemplo.com', password: 'admin' },
  { email: 'gerente@ejemplo.com', password: 'gerente' },
  { email: 'secretaria@ejemplo.com', password: 'secretaria' },
  { email: 'ingeniero@ejemplo.com', password: 'ingeniero' },
];

export const projectData = {
  nombre: `Proyecto Test ${Math.floor(Math.random() * 10000)}`,
  estado: 'solicitado',
  presupuesto: Math.floor(Math.random() * 100000) + 50000,
  cliente_id: Math.floor(Math.random() * 4) + 1, // IDs del 1 al 4 según tus datos
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: null,
  ubicacion: 'Zona de Pruebas, Guatemala',
  tipo_servicio: ['regulares', 'irregulares', 'remodelaciones', 'jacuzzis', 'paneles solares', 'fuentes y cascadas'][Math.floor(Math.random() * 6)]
};

export const projectUpdateData = {
  estados: ['solicitado', 'en progreso', 'finalizado', 'cancelado'],
  tipos_servicio: ['regulares', 'irregulares', 'remodelaciones', 'jacuzzis', 'paneles solares', 'fuentes y cascadas']
};

// Función helper para reemplazar IDs en endpoints dinámicos
export function replaceEndpointId(endpoint, id) {
  return endpoint.replace('{id}', id);
}

// Configuración de headers por defecto
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};