import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import App from '../src/app';
import type { Server } from 'http';

// The app persists to src/data/store.json. Snapshot the file before and
// restore it after the tests so real data is never lost.
const storePath = path.resolve(process.cwd(), 'src/data/store.json');
let originalContent = '';

let server: Server;
let baseUrl = '';

before(async () => {
  originalContent = fs.readFileSync(storePath, 'utf8');

  const instance = new App(0);
  server = instance.listen();
  await new Promise<void>((resolve) => server.on('listening', resolve));

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  baseUrl = `http://localhost:${port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  fs.writeFileSync(storePath, originalContent, 'utf8');
});

const uniqueName = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

async function request(path: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${baseUrl}${path}`, options);
  assert.ok(response, `no response from ${path}`);
  return response;
}

describe('api end-to-end (real http server)', () => {
  it('serves the health check', async () => {
    const res = await request('/health-check');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(await res.text(), 'Server is up and running!');
  });

  it('renders the dashboard and helper pages', async () => {
    const dashboard = await request('/dashboard');
    assert.strictEqual(dashboard.status, 200);
    const dashboardHtml = await dashboard.text();
    assert.match(dashboardHtml, /fake server local/);
    assert.match(dashboardHtml, /documentTextarea/);

    const helper = await request('/helper');
    assert.strictEqual(helper.status, 200);
    assert.match(await helper.text(), /How it works/);
  });

  it('serves static assets', async () => {
    const css = await request('/css/main.css');
    assert.strictEqual(css.status, 200);
    assert.match(await css.text(), /route-options/);

    const yaml = await request('/vendor/js-yaml/js-yaml.min.js');
    assert.strictEqual(yaml.status, 200);
  });

  it('creates a project, saves a route and serves generated data', async () => {
    const projectName = uniqueName('e2e-project');

    const createRes = await request('/__project/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName }),
    });
    assert.strictEqual(createRes.status, 201);
    const project = await createRes.json();
    assert.ok(project.id);

    const saveRes = await request('/__route/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: '',
        projectId: project.id,
        projectName,
        schema: { title: 'word', count: 'int:2', email: 'email' },
        name: '/list',
        type: 'GET',
      }),
    });
    assert.strictEqual(saveRes.status, 200);

    const dataRes = await request(`/${projectName}/list`);
    assert.strictEqual(dataRes.status, 200);
    const data = await dataRes.json();
    assert.strictEqual(typeof data.title, 'string');
    assert.ok(Number.isInteger(data.count));
    assert.match(String(data.email), /@/);

    // cleanup through the api
    const deleteRes = await request(`/__project/${project.id}/delete`, { method: 'DELETE' });
    assert.strictEqual(deleteRes.status, 200);
  });

  it('returns 400 for unknown routes and 404 for reserved projects', async () => {
    const projectName = uniqueName('e2e-unknown');

    const createRes = await request('/__project/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName }),
    });
    const project = await createRes.json();

    const missingRes = await request(`/${projectName}/missing`);
    assert.strictEqual(missingRes.status, 400);
    assert.match((await missingRes.json()).message, /not found/);

    const reservedRes = await request('/vendor/anything');
    assert.strictEqual(reservedRes.status, 404);
    assert.match((await reservedRes.json()).message, /reserved/);

    await request(`/__project/${project.id}/delete`, { method: 'DELETE' });
  });

  it('rejects reserved project names through the api', async () => {
    for (const name of ['health-check', '__project', '__route']) {
      const res = await request('/__project/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      assert.strictEqual(res.status, 400, `${name} should be rejected`);
      assert.match((await res.json()).message, /reserved/);
    }
  });
});
