// load-tests/scripts/auth.js
import { BASE_URL, endpoints, users, defaultHeaders } from '../config/config.js';
import { check } from 'k6';
import http from 'k6/http';

export function authenticate() {
  const user = users[Math.floor(Math.random() * users.length)];
  const url = `${BASE_URL}${endpoints.login}`;
  
  const payload = JSON.stringify({
    email: user.email,
    password: user.password
  });

  const params = {
    headers: defaultHeaders,
  };

  const res = http.post(url, payload, params);
  
  const loginSuccess = check(res, {
    'login successful': (r) => r.status === 200,
    'response has body': (r) => r.body && r.body.length > 0,
  });

  if (!loginSuccess) {
    console.log(`Login failed for ${user.email}: Status ${res.status}`);
    return null;
  }

  let userData = null;
  try {
    userData = res.json();
  } catch (error) {
    console.log('Failed to parse login response as JSON:', error);
    return null;
  }

  const hasValidData = check(userData, {
    'user has id': (data) => data && data.id !== undefined,
    'user has email': (data) => data && data.email !== undefined,
    'user has roles': (data) => data && Array.isArray(data.roles),
  });

  if (!hasValidData) {
    console.log('Login response missing required user data');
    return null;
  }

  // Para esta API, la autenticación se maneja por cookies automáticamente
  // Devolvemos los datos del usuario para usar en otras funciones
  return {
    userId: userData.id,
    email: userData.email,
    fullname: userData.Fullname,
    roles: userData.roles,
    permisos: userData.permisos
  };
}

export function verifyToken() {
  const url = `${BASE_URL}${endpoints.verifyToken}`;
  
  const params = {
    headers: defaultHeaders,
  };

  const res = http.get(url, params);
  
  const verifySuccess = check(res, {
    'token verification successful': (r) => r.status === 200,
    'response has valid user data': (r) => {
      try {
        const data = r.json();
        return data && data.id !== undefined;
      } catch {
        return false;
      }
    },
  });

  return verifySuccess ? res.json() : null;
}

export function logout() {
  const url = `${BASE_URL}${endpoints.logout}`;
  
  const params = {
    headers: defaultHeaders,
  };

  const res = http.post(url, null, params);
  
  check(res, {
    'logout successful': (r) => r.status === 200,
  });

  return res;
}