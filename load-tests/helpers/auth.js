// load-tests/helpers/auth.js
// Helper para autenticación en tests k6

import http from 'k6/http';

export function login(baseUrl, credentials) {
  const res = http.post(
    `${baseUrl}/services/auth/login`,
    JSON.stringify(credentials),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (res.status !== 200) {
    console.error(`Login falló: ${res.status} ${res.body}`);
    return null;
  }

  const cookies = res.headers['Set-Cookie'] || '';
  const tokenMatch = cookies.match(/token=([^;]+)/);
  
  return tokenMatch ? tokenMatch[1] : null;
}

export function getAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Cookie': `token=${token}`,
  };
}