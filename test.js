//winget install k6

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },  // разгон
    { duration: '20s', target: 30 },  // нагрузка
    { duration: '10s', target: 0 },   // спад
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],   // <1% ошибок
    http_req_duration: ['p(95)<500'], // 95% < 500ms
  },
};

const BASE_URL = 'http://localhost';

export default function () {
  // 1. health check (балансировка видно сразу)
  let res1 = http.get(`${BASE_URL}/api/health`, {
    headers: { 'Connection': 'close' }
  });

  check(res1, {
    'health status 200': (r) => r.status === 200,
    'has hostname': (r) => r.json('hostname') !== undefined,
  });

  sleep(0.5);

  // 2. products API (нагрузка на PostgreSQL)
  let res2 = http.get(`${BASE_URL}/api/products`, {
    headers: { 'Connection': 'close' }
  });

  check(res2, {
    'products status 200': (r) => r.status === 200,
    'has array': (r) => Array.isArray(r.json()),
  });

  sleep(0.5);

  // 3. family members API
  let res3 = http.get(`${BASE_URL}/api/family-members`, {
    headers: { 'Connection': 'close' }
  });

  check(res3, {
    'family status 200': (r) => r.status === 200,
  });

  sleep(1);
}