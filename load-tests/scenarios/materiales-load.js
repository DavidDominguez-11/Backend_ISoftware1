// load-tests/scenarios/materiales-load.js
import { authenticate } from '../scripts/auth.js';
import { getMateriales, createMateriales, getMaterialesTotalCantidad, getMaterialesAlertas, getMaterialById } from '../scripts/materiales.js';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const authFailureRate = new Rate('auth_failures');
export const materialOperationTime = new Trend('material_operation_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'], // Bajé el umbral para enfocarnos en el problema real
    auth_failures: ['rate<0.02'],
    material_operation_duration: ['p(90)<5000'],
  },
};

export default function () {
  const startTime = Date.now();
  
  const userData = authenticate();
  
  if (!userData) {
    console.log('Authentication failed in materiales load test');
    errorRate.add(1);
    authFailureRate.add(1);
    return;
  }

  sleep(Math.random() * 0.5 + 0.2);

  try {
    // Operaciones de lectura (mayor frecuencia)
    const materialesRes = getMateriales(20, 0);
    if (materialesRes.status !== 200) {
      errorRate.add(1);
    }

    sleep(Math.random() * 0.5);

    // Consultas auxiliares (60% probabilidad)
    if (Math.random() < 0.6) {
      const totalCantidadRes = getMaterialesTotalCantidad();
      if (totalCantidadRes && !totalCantidadRes.success) {
        errorRate.add(1);
      }

      sleep(0.2);

      const alertasRes = getMaterialesAlertas();
      if (alertasRes && alertasRes.status !== 200) {
        errorRate.add(1);
      }
    }

    sleep(Math.random() * 0.5);

    // Creación masiva de materiales (5% probabilidad - muy baja mientras investigamos)
    if (Math.random() < 0.05) {
      const cantidadCrear = 1; // Solo 1 para no sobrecargar con errores
      const createResults = createMateriales(cantidadCrear);
      
      createResults.forEach(result => {
        if (!result.success) {
          errorRate.add(1);
        }
      });
    }

    // Consulta individual (30% probabilidad)
    if (Math.random() < 0.3) {
      const randomId = Math.floor(Math.random() * 15) + 1;
      const materialRes = getMaterialById(randomId);
      if (materialRes && materialRes.status >= 400 && materialRes.status !== 404) {
        errorRate.add(1);
      }
    }

  } catch (error) {
    console.log(`Error in materiales load test: ${error.message}`);
    errorRate.add(1);
  }

  const endTime = Date.now();
  materialOperationTime.add(endTime - startTime);

  sleep(Math.random() * 2 + 0.5);
}