// load-tests/scripts/projects.js
import { BASE_URL, endpoints, projectData } from '../config/config.js';
import { check, sleep } from 'k6';
import http from 'k6/http';

export function getProjects(token) {
  const url = `${BASE_URL}${endpoints.projects}`;
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(url, params);
  
  check(res, {
    'get projects successful': (r) => r.status === 200,
  });

  return res;
}

export function createProject(token) {
  const url = `${BASE_URL}${endpoints.projects}`;
  const payload = JSON.stringify(projectData);
  
  const params = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'create project successful': (r) => r.status === 201,
  });

  return res;
}