import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '10s', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<1000'],
  },
};

const BASE_URL = 'http://localhost';

function validStatus(res, allowed) {
  return res && allowed.includes(res.status);
}

export default function () {
  try {
    const health = http.get(`${BASE_URL}/api/health/`);

    check(health, {
      'health ok': (r) =>
        validStatus(r, [200, 503]),
    });

    const products = http.get(`${BASE_URL}/api/products/`);

    check(products, {
      'products ok': (r) =>
        validStatus(r, [200, 503]),
    });

    const groups = http.get(`${BASE_URL}/api/my-groups/`);

    check(groups, {
      'groups ok': (r) =>
        validStatus(r, [200, 401, 403, 503]),
    });

  } catch (e) {
    console.log(`request failed during restart: ${e}`);
  }

  sleep(1);
}