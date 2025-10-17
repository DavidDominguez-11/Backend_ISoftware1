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
  updateProject: '/services/projects/{id}',

  // Materiales endpoints
  materiales: '/services/materiales',
  materialesTotalCantidad: '/services/materiales/total-cantidad',
  materialesAlertas: '/services/materiales/alertas',
  materialById: '/services/materiales/{id}',
  deleteMaterial: '/services/materiales/{id}',
  
  // Bodega materiales endpoints
  bodegaMateriales: '/services/bodega-materiales',
};

export const users = [
  { email: 'admin@ejemplo.com', password: 'admin' },
  { email: 'ingeniero@ejemplo.com', password: 'ingeniero' },
  { email: 'secretaria@ejemplo.com', password: 'secretaria' },
];

export const projectData = {
  nombre: `Proyecto Test ${Math.floor(Math.random() * 10000)}`,
  estado: 'solicitado',
  presupuesto: Math.floor(Math.random() * 100000) + 50000,
  cliente_id: Math.floor(Math.random() * 10) + 1, // IDs del 1 al 10 según tu data.sql
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: null,
  ubicacion: 'Zona de Pruebas, Guatemala',
  tipo_servicio: ['regulares', 'irregulares', 'remodelaciones', 'jacuzzis', 'paneles solares', 'fuentes y cascadas'][Math.floor(Math.random() * 6)]
};

export const materialesData = {
  codigo: `TMP${Math.floor(Math.random() * 1000)}`,
  material: `Material Test ${Math.floor(Math.random() * 10000)}`,
  descripcion: 'Material para pruebas de carga',
  cantidad: Math.floor(Math.random() * 100) + 10,
  unidad_medida: ['pieza', 'litro', 'kg', 'm', 'm2', 'm3'][Math.floor(Math.random() * 6)],
  precio_unitario: Math.floor(Math.random() * 500) + 50,
  estado_material_id: Math.floor(Math.random() * 3) + 1,
  proveedor_id: Math.floor(Math.random() * 3) + 1,
};

export const bodegaMaterialesData = {
  material_id: 1, // ID del material existente en tu base de datos
  tipo: ['Entrada', 'Salida'][Math.floor(Math.random() * 2)], // Campo correcto según tu DB
  cantidad: Math.floor(Math.random() * 50) + 1,
  fecha: new Date().toISOString().split('T')[0], // Campo correcto según tu DB
  observaciones: 'Movimiento generado para pruebas de carga',
  proyecto_id: null // Opcional, solo para salidas
};

export const projectUpdateData = {
  estados: ['Solicitado', 'En Progreso', 'Finalizado', 'Cancelado'], // Nombres correctos según tu DB
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