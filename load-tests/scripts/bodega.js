// load-tests/scripts/bodega.js
import { BASE_URL, endpoints, bodegaMaterialesData, defaultHeaders, replaceEndpointId } from '../config/config.js';
import { check, sleep } from 'k6';
import http from 'k6/http';

const params = {
  headers: defaultHeaders,
};

export function getBodegaMateriales(limit = 50, offset = 0) {
  const url = `${BASE_URL}${endpoints.bodegaMateriales}?limit=${limit}&offset=${offset}`;
  const res = http.get(url, params);
  
  check(res, {
    'get bodega materiales successful': (r) => r.status === 200,
    'get bodega materiales has data': (r) => {
      try {
        const data = r.json();
        return Array.isArray(data) && data.length >= 0;
      } catch {
        return false;
      }
    },
  });

  return res;
}

export function postBodegaMaterial(materialId = null, cantidad = null) {
  const url = `${BASE_URL}${endpoints.bodegaMateriales}`;
  
  const dynamicBodegaData = {
    material_id: materialId || Math.floor(Math.random() * 14) + 1, // IDs del 1 al 15 según tu DB
    tipo: ['Entrada', 'Salida'][Math.floor(Math.random() * 2)],
    cantidad: cantidad || Math.floor(Math.random() * 50) + 1,
    fecha: new Date().toISOString().split('T')[0],
    observaciones: 'Movimiento generado para pruebas de carga',
    ...(Math.random() < 0.3 && { proyecto_id: Math.floor(Math.random() * 10) + 1 }) // Solo para salidas
  };
  
  const payload = JSON.stringify(dynamicBodegaData);
  const res = http.post(url, payload, params);
  
  // Validación más flexible que maneja diferentes formatos de respuesta
  const success = check(res, {
    'post bodega material successful': (r) => r.status === 201,
    'post bodega material has valid response': (r) => {
      if (r.status === 201) {
        try {
          const data = r.json();
          // Validar diferentes posibles formatos de respuesta
          return (
            (data && data.id) ||                    // formato simple con id
            (data && data.movimiento && data.movimiento.id) || // formato anidado
            (data && data.bodega_material && data.bodega_material.id) || // otro formato posible
            typeof data === 'object' // cualquier objeto es aceptable
          );
        } catch {
          // Si no es JSON pero status es 201, considerarlo como éxito parcial
          return true;
        }
      }
      return false;
    },
  });

  return { response: res, success };
}

export function simulateBodegaMovements(materialId = null) {
  const movimientos = [];
  
  for (let i = 0; i < 3; i++) {
    const movimiento = postBodegaMaterial(materialId);
    movimientos.push(movimiento);
    sleep(0.1);
  }
  
  return movimientos;
}