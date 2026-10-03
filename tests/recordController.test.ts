import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import HealthController from '../src/controllers/healthController';
import RecordController from '../src/controllers/recordController';

// Controllers persist to src/data/store.json via the shared DatabaseService
// singleton. Snapshot the file before and restore it after the tests.
const storePath = path.resolve(process.cwd(), 'src/data/store.json');
let originalContent = '';
let storeExisted = false;

before(() => {
  storeExisted = fs.existsSync(storePath);
  originalContent = storeExisted ? fs.readFileSync(storePath, 'utf8') : '';
});

after(() => {
  if (storeExisted) {
    fs.writeFileSync(storePath, originalContent, 'utf8');
  } else if (fs.existsSync(storePath)) {
    fs.unlinkSync(storePath);
  }
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

describe('HealthController', () => {
  it('returns 200 with the health message', () => {
    const res = mockRes();
    HealthController.checkHealth(mockReq(), res as any);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body, 'Server is up and running!');
  });
});

describe('RecordController - project create/update validation', () => {
  it('rejects reserved project names on create', () => {
    ['health-check', '__project', '__route'].forEach((name) => {
      const res = mockRes();
      RecordController.createProject(mockReq({ body: { name } }), res as any);
      assert.strictEqual(res.statusCode, 400, `create "${name}" should be rejected`);
      assert.match(res.body.message, /reserved/);
    });
  });

  it('rejects reserved project names on update', () => {
    ['health-check', '__project', '__route'].forEach((name) => {
      const res = mockRes();
      RecordController.updateProject(
        mockReq({ params: { projectId: 'any-id' }, body: { name } }),
        res as any
      );
      assert.strictEqual(res.statusCode, 400, `update to "${name}" should be rejected`);
      assert.match(res.body.message, /reserved/);
    });
  });

  it('rejects an empty project name on create', () => {
    const res = mockRes();
    RecordController.createProject(mockReq({ body: { name: '' } }), res as any);
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Invalid project name');
  });

  it('rejects an empty project name on update', () => {
    const res = mockRes();
    RecordController.updateProject(
      mockReq({ params: { projectId: 'any-id' }, body: { name: '' } }),
      res as any
    );
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.message, 'Valid project name is required');
  });

  it('rejects update without a projectId', () => {
    const res = mockRes();
    RecordController.updateProject(mockReq({ body: { name: 'valid-name' } }), res as any);
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /projectId/);
  });

  it('accepts a non-reserved project name on create', () => {
    const name = uniqueName('ctrl-create');
    const res = mockRes();
    RecordController.createProject(mockReq({ body: { name } }), res as any);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.name, name);
    assert.ok(res.body.id);
    RecordController.deleteProject(mockReq({ params: { projectId: res.body.id } }), mockRes() as any);
  });
});

describe('RecordController - project lifecycle', () => {
  it('creates, updates and deletes a project', () => {
    const name = uniqueName('ctrl-lifecycle');
    const createRes = mockRes();
    RecordController.createProject(mockReq({ body: { name } }), createRes as any);
    assert.strictEqual(createRes.statusCode, 201);
    const projectId = createRes.body.id;

    const updateRes = mockRes();
    RecordController.updateProject(
      mockReq({ params: { projectId }, body: { name: `${name}-updated` } }),
      updateRes as any
    );
    assert.strictEqual(updateRes.statusCode, 200);
    assert.strictEqual(updateRes.body.name, `${name}-updated`);

    const deleteRes = mockRes();
    RecordController.deleteProject(mockReq({ params: { projectId } }), deleteRes as any);
    assert.strictEqual(deleteRes.statusCode, 200);
    assert.ok(Array.isArray(deleteRes.body));
    assert.ok(!deleteRes.body.some((p: any) => p.id === projectId));
  });

  it('rejects delete without a projectId', () => {
    const res = mockRes();
    RecordController.deleteProject(mockReq(), res as any);
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /projectId/);
  });
});

describe('RecordController - route operations', () => {
  it('returns initial data with projectList', () => {
    const res = mockRes();
    RecordController.getInitialData(mockReq(), res as any);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.projectList));
    assert.ok(res.body.selectedProject);
  });

  it('rejects saveRoute without a projectId', () => {
    const res = mockRes();
    RecordController.saveRoute(
      mockReq({ body: { name: '/list', type: 'GET', schema: { title: 'title' } } }),
      res as any
    );
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /projectId/);
  });

  it('rejects saveRoute without name, type or schema', () => {
    const res = mockRes();
    RecordController.saveRoute(mockReq({ body: { projectId: 'any-id', name: '/list' } }), res as any);
    assert.strictEqual(res.statusCode, 400);
    assert.match(res.body.message, /required/);
  });

  it('saves a route and lists it for the project', () => {
    const projectName = uniqueName('ctrl-routes');
    const createRes = mockRes();
    RecordController.createProject(mockReq({ body: { name: projectName } }), createRes as any);
    const projectId = createRes.body.id;

    const saveRes = mockRes();
    RecordController.saveRoute(
      mockReq({
        body: { projectId, projectName, name: '/list', type: 'GET', schema: { title: 'title' } },
      }),
      saveRes as any
    );
    assert.strictEqual(saveRes.statusCode, 200);
    assert.ok(saveRes.body.id);

    const listRes = mockRes();
    RecordController.getRouteList(mockReq({ params: { projectId } }), listRes as any);
    assert.strictEqual(listRes.statusCode, 200);
    assert.ok(Array.isArray(listRes.body));
    assert.strictEqual(listRes.body.length, 1);
    assert.strictEqual(listRes.body[0].name, '/list');
    assert.strictEqual(listRes.body[0].type, 'GET');

    RecordController.deleteProject(mockReq({ params: { projectId } }), mockRes() as any);
  });

  it('removes a route from a project', () => {
    const projectName = uniqueName('ctrl-remove');
    const createRes = mockRes();
    RecordController.createProject(mockReq({ body: { name: projectName } }), createRes as any);
    const projectId = createRes.body.id;

    const saveRes = mockRes();
    RecordController.saveRoute(
      mockReq({
        body: { projectId, projectName, name: '/list', type: 'GET', schema: { title: 'title' } },
      }),
      saveRes as any
    );
    const routeId = saveRes.body.id;

    const removeRes = mockRes();
    RecordController.removeRoute(
      mockReq({ params: { projectId, routeId } }),
      removeRes as any
    );
    assert.strictEqual(removeRes.statusCode, 200);
    assert.strictEqual(removeRes.body.message, 'Route deleted successfully');

    RecordController.deleteProject(mockReq({ params: { projectId } }), mockRes() as any);
  });
});
