import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import ProjectController from '../src/controllers/projectController';
import RecordController from '../src/controllers/recordController';

// Controllers persist to src/data/store.json via the shared DatabaseService
// singleton. Snapshot the file before and restore it after the tests.
const storePath = path.resolve(process.cwd(), 'src/data/store.json');
let originalContent = '';

before(() => {
  originalContent = fs.readFileSync(storePath, 'utf8');
});

after(() => {
  fs.writeFileSync(storePath, originalContent, 'utf8');
});

interface MockRes {
  statusCode: number;
  body: any;
  status(code: number): MockRes;
  json(data: any): MockRes;
  send(data: any): MockRes;
}

function mockRes(): MockRes {
  const res: MockRes = {
    statusCode: 200,
    body: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.body = data;
      return this;
    },
    send(data: any) {
      this.body = data;
      return this;
    },
  };
  return res;
}

function mockReq(overrides: any = {}) {
  return { body: {}, params: {}, query: {}, method: 'GET', ...overrides };
}

const uniqueName = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

/** Create a project through the controller and return its id + name. */
function createProject(): { id: string; name: string } {
  const name = uniqueName('pc-project');
  const res = mockRes();
  RecordController.createProject(mockReq({ body: { name } }), res as any);
  assert.strictEqual(res.statusCode, 201, `project creation failed: ${JSON.stringify(res.body)}`);
  return { id: res.body.id, name };
}

/** Save a route through the controller and return its id. */
function saveRoute(projectId: string, projectName: string, name: string, type: string, schema: any): string {
  const res = mockRes();
  RecordController.saveRoute(
    mockReq({ body: { projectId, projectName, name, type, schema } }),
    res as any
  );
  assert.strictEqual(res.statusCode, 200, `route save failed: ${JSON.stringify(res.body)}`);
  return res.body.id;
}

function deleteProject(projectId: string) {
  RecordController.deleteProject(mockReq({ params: { projectId } }), mockRes() as any);
}

describe('ProjectController - mock api endpoint', () => {
  it('rejects reserved project names with 404', () => {
    ['vendor', '.well-known'].forEach((name) => {
      const res = mockRes();
      ProjectController.handleProjectRequest(
        mockReq({ params: { project: name, 0: 'anything' }, method: 'GET' }),
        res as any
      );
      assert.strictEqual(res.statusCode, 404, `${name} should be rejected`);
      assert.match(res.body.message, /reserved/);
    });
  });

  it('returns 400 for an unknown route', () => {
    const { id, name } = createProject();
    const res = mockRes();
    ProjectController.handleProjectRequest(
      mockReq({ params: { project: name, 0: 'missing' }, method: 'GET' }),
      res as any
    );
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /not found/);
    deleteProject(id);
  });

  it('returns generated data for a matching route', () => {
    const { id, name } = createProject();
    saveRoute(id, name, '/list', 'GET', { name: 'word', count: 'int:2' });

    const res = mockRes();
    ProjectController.handleProjectRequest(
      mockReq({ params: { project: name, 0: 'list' }, method: 'GET' }),
      res as any
    );
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(typeof res.body.name, 'string');
    assert.ok(Number.isInteger(res.body.count));
    assert.ok(res.body.count >= 10 && res.body.count <= 99);
    deleteProject(id);
  });

  it('respects the http method', () => {
    const { id, name } = createProject();
    saveRoute(id, name, '/list', 'POST', { name: 'word' });

    const getRes = mockRes();
    ProjectController.handleProjectRequest(
      mockReq({ params: { project: name, 0: 'list' }, method: 'GET' }),
      getRes as any
    );
    assert.strictEqual(getRes.statusCode, 400, 'GET should not match a POST route');

    const postRes = mockRes();
    ProjectController.handleProjectRequest(
      mockReq({ params: { project: name, 0: 'list' }, method: 'POST' }),
      postRes as any
    );
    assert.strictEqual(postRes.statusCode, 200);
    assert.strictEqual(typeof postRes.body.name, 'string');
    deleteProject(id);
  });

  it('matches dynamic :param routes', () => {
    const { id, name } = createProject();
    saveRoute(id, name, '/users/:id', 'GET', { id: 'uuid' });

    const res = mockRes();
    ProjectController.handleProjectRequest(
      mockReq({ params: { project: name, 0: 'users/123' }, method: 'GET' }),
      res as any
    );
    assert.strictEqual(res.statusCode, 200);
    assert.match(String(res.body.id), /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    deleteProject(id);
  });

  it('returns 400 (not a crash) when the request path is longer than the route', () => {
    const { id, name } = createProject();
    saveRoute(id, name, '/users/:id', 'GET', { id: 'uuid' });

    const res = mockRes();
    ProjectController.handleProjectRequest(
      mockReq({ params: { project: name, 0: 'users/123/extra' }, method: 'GET' }),
      res as any
    );
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /not found/);
    deleteProject(id);
  });

  it('generates a jwt for token schemas', () => {
    const { id, name } = createProject();
    saveRoute(id, name, '/token', 'GET', {
      __type: 'token',
      __property: { userId: 'uuid' },
    });

    const res = mockRes();
    ProjectController.handleProjectRequest(
      mockReq({ params: { project: name, 0: 'token' }, method: 'GET' }),
      res as any
    );
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(typeof res.body, 'string');
    assert.strictEqual(res.body.split('.').length, 3);
    deleteProject(id);
  });

  it('generates nested and array data through the full pipeline', () => {
    const { id, name } = createProject();
    saveRoute(id, name, '/complex', 'GET', {
      user: { email: 'email', active: 'boolean' },
      tags: { __type: 'array', __range: '2,4', __property: 'word' },
    });

    const res = mockRes();
    ProjectController.handleProjectRequest(
      mockReq({ params: { project: name, 0: 'complex' }, method: 'GET' }),
      res as any
    );
    assert.strictEqual(res.statusCode, 200);
    assert.match(String(res.body.user.email), /@/);
    assert.strictEqual(typeof res.body.user.active, 'boolean');
    assert.ok(Array.isArray(res.body.tags));
    assert.ok(res.body.tags.length >= 2 && res.body.tags.length <= 4);
    res.body.tags.forEach((tag: any) => assert.strictEqual(typeof tag, 'string'));
    deleteProject(id);
  });
});
