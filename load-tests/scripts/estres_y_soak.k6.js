// load-tests/estres_y_soak.k6.js
// Pruebas de Estrés (carga incremental) y Soak (duración prolongada)

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ==================== CONFIGURACIÓN ====================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

// Métricas personalizadas
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const projectsDuration = new Trend('projects_duration');

// Credenciales de prueba (usuario admin del seed)
const ADMIN_CREDENTIALS = {
  email: 'admin@ejemplo.com',
  password: 'admin'
};

// ==================== OPCIONES DE TEST ====================

// Cambia entre 'stress' y 'soak' según lo que quieras ejecutar
const TEST_TYPE = __ENV.TEST_TYPE || 'stress'; // 'stress' o 'soak'

export const options = {
  // Configuración según tipo de test
  stages: TEST_TYPE === 'stress' ? [
    // ESTRÉS: Carga incremental hasta degradación
    { duration: '2m', target: 10 },   // Calentamiento
    { duration: '2m', target: 50 },   // Incremento moderado
    { duration: '2m', target: 100 },  // Incremento medio
    { duration: '2m', target: 200 },  // Incremento alto
    { duration: '2m', target: 300 },  // Pico máximo
    { duration: '2m', target: 50 },   // Enfriamiento
    { duration: '3m', target: 0 },    // Finalización
  ] : [
    // SOAK: Carga constante prolongada
    { duration: '2m', target: 25 },   // Ramp-up
    { duration: '30m', target: 25 },  // Carga constante (ajustar 30-60 min)
    { duration: '2m', target: 0 },    // Ramp-down
  ],

  // Umbrales de aceptación
  thresholds: TEST_TYPE === 'stress' ? {
    // Para ESTRÉS: más permisivo bajo pico
    'http_req_duration': ['p(95)<2400', 'p(99)<5100'],
    'http_req_failed': ['rate<0.15'], // < 15% errores (ajustado debido a errores transitorios durante el estrés)
    'errors': ['rate<0.05'],
  } : {
    // Para SOAK: más estricto (buscar estabilidad)
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
    'http_req_failed': ['rate<0.01'], // < 1% errores
    'errors': ['rate<0.01'],
  },

  // Configuración adicional
  summaryTrendStats: ['min', 'avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  noConnectionReuse: false,
  userAgent: 'K6LoadTest/1.0',
};

// ==================== SETUP (ejecuta 1 vez) ====================

export function setup() {
  console.log(`\n🚀 Iniciando prueba de ${TEST_TYPE.toUpperCase()}`);
  console.log(`📍 Target: ${BASE_URL}`);
  
  // Login para obtener cookie de sesión
  const loginRes = http.post(
    `${BASE_URL}/services/auth/login`,
    JSON.stringify(ADMIN_CREDENTIALS),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const loginSuccess = check(loginRes, {
    'setup: login exitoso': (r) => r.status === 200,
  });

  if (!loginSuccess) {
    console.error('❌ Setup falló: No se pudo autenticar');
    return null;
  }

  // Extraer cookie de sesión
  const cookies = loginRes.headers['Set-Cookie'] || '';
  const tokenMatch = cookies.match(/token=([^;]+)/);
  const authToken = tokenMatch ? tokenMatch[1] : null;

  console.log('✅ Setup completado: Sesión autenticada\n');

  return {
    authToken,
    baseUrl: BASE_URL,
  };
}

// ==================== FUNCIÓN PRINCIPAL (cada VU ejecuta esto) ====================

export default function(data) {
  if (!data || !data.authToken) {
    console.error('❌ No hay token de autenticación');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': `token=${data.authToken}`,
  };

  // Distribución de carga (basada en probabilidad)
  const scenario = Math.random();

  // 40% - Lectura de proyectos (operación más común)
  if (scenario < 0.40) {
    group('GET /services/projects', () => {
      const res = http.get(`${data.baseUrl}/services/projects`, { headers });
      
      const success = check(res, {
        'proyectos: status 200': (r) => r.status === 200,
        'proyectos: es array': (r) => Array.isArray(JSON.parse(r.body)),
      });
      
      projectsDuration.add(res.timings.duration);
      errorRate.add(!success);
    });
  }
  
  // 20% - Lectura de materiales
  else if (scenario < 0.60) {
    group('GET /services/materiales', () => {
      const res = http.get(`${data.baseUrl}/services/materiales`, { headers });
      
      const success = check(res, {
        'materiales: status 200': (r) => r.status === 200,
      });
      
      errorRate.add(!success);
    });
  }
  
  // 15% - Login (simular usuarios entrando)
  else if (scenario < 0.75) {
    group('POST /services/auth/login', () => {
      const res = http.post(
        `${data.baseUrl}/services/auth/login`,
        JSON.stringify(ADMIN_CREDENTIALS),
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const success = check(res, {
        'login: status 200': (r) => r.status === 200,
        'login: tiene cookie': (r) => r.headers['Set-Cookie'] !== undefined,
      });
      
      loginDuration.add(res.timings.duration);
      errorRate.add(!success);
    });
  }
  
  // 10% - Creación de materiales (batch pequeño)
  else if (scenario < 0.85) {
    group('POST /services/materiales', () => {
      const timestamp = Date.now();
      const materialesPayload = {
        materiales: [
          { codigo: `TEST-K6-${timestamp}-1`, material: `Material Test 1 ${timestamp}` },
          { codigo: `TEST-K6-${timestamp}-2`, material: `Material Test 2 ${timestamp}` },
          { codigo: `TEST-K6-${timestamp}-3`, material: `Material Test 3 ${timestamp}` },
        ]
      };
      
      const res = http.post(
        `${data.baseUrl}/services/materiales`,
        JSON.stringify(materialesPayload),
        { headers }
      );
      
      const success = check(res, {
        'crear materiales: status 201 o 400': (r) => r.status === 201 || r.status === 400,
      });
      
      errorRate.add(!success);
    });
  }
  
  // 10% - Movimientos de bodega
  else if (scenario < 0.95) {
    group('POST /services/bodega-materiales', () => {
      const movimientoPayload = {
        material_id: Math.floor(Math.random() * 10) + 1, // IDs del 1-10 (ajustar según seed)
        tipo: 'entrada',
        cantidad: Math.floor(Math.random() * 50) + 1,
        fecha: new Date().toISOString().split('T')[0],
        observaciones: 'Movimiento de prueba k6'
      };
      
      const res = http.post(
        `${data.baseUrl}/services/bodega-materiales`,
        JSON.stringify(movimientoPayload),
        { headers }
      );
      
      const success = check(res, {
        'bodega: status 201 o 400': (r) => r.status === 201 || r.status === 400,
      });
      
      errorRate.add(!success);
    });
  }
  
  // 5% - Actualización de estado de proyecto
  else {
    group('PATCH /services/projects/:id/estado', () => {
      const projectId = Math.floor(Math.random() * 4) + 1; // IDs del 1-4 (ajustar según seed)
      const estados = ['solicitado', 'en progreso', 'finalizado'];
      const estadoAleatorio = estados[Math.floor(Math.random() * estados.length)];
      
      const res = http.patch(
        `${data.baseUrl}/services/projects/${projectId}/estado`,
        JSON.stringify({ estado: estadoAleatorio }),
        { headers }
      );
      
      const success = check(res, {
        'actualizar proyecto: status 200 o 400': (r) => r.status === 200 || r.status === 400,
      });
      
      errorRate.add(!success);
    });
  }

  // Think time (pausa entre requests para simular usuario real)
  sleep(Math.random() * 2 + 1); // 1-3 segundos
}

// ==================== TEARDOWN (ejecuta 1 vez al final) ====================

export function teardown(data) {
  if (!data) return;
  
  console.log('\n🏁 Prueba finalizada');
  console.log('📊 Revisa las métricas arriba para análisis detallado');
  
  // Opcional: Logout (si el endpoint existe)
  // http.post(`${data.baseUrl}/services/auth/logout`);
}

// ==================== NOTAS DE USO ====================

/*
CÓMO EJECUTAR:

1. Prueba de ESTRÉS (carga incremental):
   k6 run --env TEST_TYPE=stress --out json=load-tests/results/estres_$(date +%Y%m%d_%H%M%S).json load-tests/scripts/estres_y_soak.k6.js

2. Prueba SOAK (duración prolongada):
   k6 run --env TEST_TYPE=soak --out json=load-tests/results/soak_$(date +%Y%m%d_%H%M%S).json load-tests/scripts/estres_y_soak.k6.js

3. Cambiar URL del backend:
   k6 run --env BASE_URL=http://127.0.0.1:4000 --env TEST_TYPE=stress load-tests/scripts/estres_y_soak.k6.js

4. Monitorear Docker durante la prueba (en otra terminal):
   docker stats my-backend my-postgres

INTERPRETACIÓN DE RESULTADOS:

- http_req_duration (p95/p99): latencias percentiles
- http_req_failed: tasa de requests fallidos
- http_reqs: throughput total (req/s)
- errors: tasa de errores personalizada
- vus_max: pico de usuarios virtuales alcanzado

AJUSTES RECOMENDADOS:

- Modifica 'stages' en options para cambiar duración/intensidad
- Ajusta 'thresholds' según tus RNF específicos
- Cambia IDs de proyectos/materiales según tu seed de datos
- Ajusta distribución de escenarios (porcentajes) según uso real esperado
- Aumenta/reduce sleep() para simular think time diferente
*/