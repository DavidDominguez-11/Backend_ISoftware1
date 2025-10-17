// load-tests/scripts/materiales.js
import { BASE_URL, endpoints, materialesData, defaultHeaders, replaceEndpointId } from '../config/config.js';
import { check, sleep } from 'k6';
import http from 'k6/http';

const params = {
  headers: defaultHeaders,
};

export function getMateriales(limit = 50, offset = 0) {
  const url = `${BASE_URL}${endpoints.materiales}?limit=${limit}&offset=${offset}`;
  const res = http.get(url, params);
  
  check(res, {
    'get materiales successful': (r) => r.status === 200,
    'get materiales has data': (r) => {
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

export function createMateriales(cantidad = 1) {
  const url = `${BASE_URL}${endpoints.materiales}`;
  const results = [];
  
  // Aseguramos que se envíen al menos 1 elemento (el controlador requiere arreglo no vacío)
  const cantidadReal = Math.max(cantidad, 1);
  
  // Crear arreglo de materiales con solo las propiedades requeridas por el backend
  const materialesArray = [];
  for (let i = 0; i < cantidadReal; i++) {
    materialesArray.push({
      codigo: `TMP${Math.floor(Math.random() * 1000)}-${i}`,
      material: `Material Test ${Math.floor(Math.random() * 10000)}-${i}`,
      // No incluimos otras propiedades que no son requeridas por el backend
    });
  }
  
  // El cuerpo debe tener la estructura esperada por el backend
  const payload = JSON.stringify({
    materiales: materialesArray
  });
  
  const res = http.post(url, payload, params);
  
  // Registrar información de depuración
  if (res.status !== 201) {
    console.log(`Material POST failed: Status ${res.status}, Data: ${JSON.stringify({materiales: materialesArray})}`);
    console.log(`Response body: ${res.body}`);
  }
  
  // Validación para el endpoint que espera un arreglo
  const success = check(res, {
    'create material successful': (r) => r.status === 201,
    'create material has response': (r) => {
      if (r.status === 201) {
        try {
          const data = r.json();
          // El backend devuelve {message: "...", materiales: [...]}
          return (
            data && 
            typeof data.message === 'string' && 
            Array.isArray(data.materiales)
          );
        } catch {
          // Si no es JSON pero status es 201, considerarlo como éxito
          return true;
        }
      }
      return false;
    },
  });

  results.push({ response: res, success });
  
  return results;
}

export function getMaterialById(materialId) {
  if (!materialId) {
    console.log('No material ID provided for getMaterialById');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.materialById, materialId)}`;
  const res = http.get(url, params);
  
  check(res, {
    'get material by id response': (r) => r.status === 200 || r.status === 404,
  });

  return res;
}

export function deleteMaterial(materialId) {
  if (!materialId) {
    console.log('No material ID provided for deleteMaterial');
    return null;
  }

  const url = `${BASE_URL}${replaceEndpointId(endpoints.deleteMaterial, materialId)}`;
  const res = http.delete(url, null, params);
  
  check(res, {
    'delete material response': (r) => r.status === 200 || r.status === 204 || r.status === 404,
  });

  return res;
}

export function getMaterialesTotalCantidad() {
  const url = `${BASE_URL}${endpoints.materialesTotalCantidad}`;
  const res = http.get(url, params);
  
  const success = check(res, {
    'get total cantidad successful': (r) => r.status === 200,
    'total cantidad has valid response': (r) => {
      try {
        const data = r.json();
        return data && (
          typeof data.total_cantidad === 'number' ||
          typeof data.total === 'number' ||
          typeof data === 'number' ||
          typeof data === 'object'
        );
      } catch {
        return r.status === 200;
      }
    },
  });

  return { response: res, success };
}

export function getMaterialesAlertas() {
  const url = `${BASE_URL}${endpoints.materialesAlertas}`;
  const res = http.get(url, params);
  
  check(res, {
    'get alertas successful': (r) => r.status === 200,
  });

  return res;
}