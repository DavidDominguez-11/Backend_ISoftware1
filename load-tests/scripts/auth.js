// load-tests/scripts/auth.js
import { BASE_URL, endpoints, users } from '../config/config.js';
import { check, sleep } from 'k6';
import http from 'k6/http';

export function authenticate() {
  const user = users[Math.floor(Math.random() * users.length)];
  const url = `${BASE_URL}${endpoints.login}`;
  
  const payload = JSON.stringify({
    email: user.username,
    password: user.password
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'login successful': (r) => r.status === 200,
    'received token': (r) => r.json().token !== undefined,
  });

  return res.json().token;
}