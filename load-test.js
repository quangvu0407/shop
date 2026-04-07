import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const productListTrend = new Trend('product_list_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
    product_list_duration: ['p(95)<1500'],
  },
};

const BASE = 'http://localhost:3000';

export default function () {
  group('Product List', () => {
    const res = http.get(`${BASE}/api/product/list`);
    productListTrend.add(res.timings.duration);
    const ok = check(res, {
      'status 200': (r) => r.status === 200,
      'has data': (r) => r.body != null && r.body.length > 0,
    });
    errorRate.add(!ok);
  });

  sleep(1);

  group('Product Page', () => {
    const res = http.get(`${BASE}/api/product/listpage?page=1&limit=10`);
    check(res, { 'status 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });

  sleep(1);

  group('Comment List', () => {
    const res = http.get(`${BASE}/api/comment/list`);
    check(res, { 'status 200 or 401': (r) => [200, 401, 404].includes(r.status) });
  });

  sleep(1);
}
