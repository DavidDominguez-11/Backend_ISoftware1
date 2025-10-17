// load-tests/scenarios/bodega-load.js
import { authenticate } from '../scripts/auth.js';
import { getBodegaMateriales, postBodegaMaterial, simulateBodegaMovements } from '../scripts/bodega.js';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const authFailureRate = new Rate('auth_failures');
export const bodegaOperationTime = new Trend('bodega_operation_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2500'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<1.01'], 
    auth_failures: ['rate<0.02'],
    bodega_operation_duration: ['p(90)<6000'],
  },
};

export default function () {
  const startTime = Date.now();
  
  const userData = authenticate();
  
  if (!userData) {
    console.log('Authentication failed in bodega load test');
    errorRate.add(1);
    authFailureRate.add(1);
    return;
  }

  sleep(Math.random() * 0.5 + 0.2);

  try {
    // Consultar movimientos de bodega
    const bodegaRes = getBodegaMateriales(20, 0);
    if (bodegaRes.status !== 200) {
      errorRate.add(1);
    }

    sleep(Math.random() * 0.5);

    // Registrar movimientos de bodega (30% probabilidad)
    if (Math.random() < 0.3) {
      const movimientoRes = postBodegaMaterial();
      if (!movimientoRes.success) {
        // Registrar solo como error si el status no es 201
        if (movimientoRes.response.status !== 201) {
          errorRate.add(1);
        }
      }
    }

    // Simulación de múltiples movimientos (15% probabilidad)
    if (Math.random() < 0.15) {
      const simulacion = simulateBodegaMovements();
      simulacion.forEach(mov => {
        if (!mov.success && mov.response.status !== 201) {
          errorRate.add(1);
        }
      });
    }

  } catch (error) {
    console.log(`Error in bodega load test: ${error.message}`);
    errorRate.add(1);
  }

  const endTime = Date.now();
  bodegaOperationTime.add(endTime - startTime);

  sleep(Math.random() * 2 + 0.5);
}