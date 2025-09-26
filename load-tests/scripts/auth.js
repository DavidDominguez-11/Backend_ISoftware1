// load-tests/scripts/auth.js (versión corregida)
import { BASE_URL, endpoints, users } from '../config/config.js';
import { check } from 'k6';
import http from 'k6/http';

export function authenticate() {
  const user = users[Math.floor(Math.random() * users.length)];
  const url = `${BASE_URL}${endpoints.login}`;
  
  const payload = JSON.stringify({
    email: user.username,
    password: user.password
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(url, payload, params);
  
  const success = check(res, {
    'login successful': (r) => r.status === 200,
  });

  // Si el login fue exitoso, intenta obtener el token
  if (!success) {
    return null; // Devuelve null si el login falló
  }

  // Ahora es más seguro acceder al JSON
  const token = res.json('token'); // Usar el selector de k6 es más seguro
  
  check(res, {
    'received token': () => token !== undefined && token !== null,
  });

  return token;
}