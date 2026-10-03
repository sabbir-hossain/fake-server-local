import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import DatabaseService from '../src/service/database.service';
import { ProjectService } from '../src/service/project.service';

// The service persists to src/data/store.json. Snapshot it before the tests
// and restore it afterwards so the real data is never lost.
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

const uniqueName = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

describe('DatabaseService', () => {
  const db = DatabaseService.getInstance();

  describe('getInstance', () => {
    it('returns the same singleton instance every time', () => {
      assert.strictEqual(DatabaseService.getInstance(), db);
    });
  });

  describe('getAllProjects', () => {
    it('returns an array of projects with id and name', () => {
      const projects = db.getAllProjects();
      assert.ok(Array.isArray(projects));
      projects.forEach((project: any) => {
        assert.strictEqual(project.type, 'project');
        assert.ok(project.id);
        assert.ok(project.name);
      });
    });
  });

  describe('getProjectData', () => {
    it('returns a project by name', () => {
      const projects = db.getAllProjects();
      if (projects.length === 0) {
        return; // nothing to verify when there is no data
      }
      const first = projects[0];
      const found = db.getProjectData(first.name as string);
      assert.ok(found);
      assert.strictEqual(found!.id, first.id);
    });

    it('returns undefined for an unknown project name', () => {
      assert.strictEqual(db.getProjectData(uniqueName('missing')), undefined);
    });
  });

  describe('saveProject / updateProject / deleteProject', () => {
    it('creates, renames and removes a project', () => {
      const name = uniqueName('svc-project');
      const created = db.saveProject({
        name,
        type: 'project',
        selected: false,
        status: true,
      });
      assert.ok(created.id);
      assert.strictEqual(db.getProjectData(name)?.id, created.id);

      const renamed = `${name}-renamed`;
      const updated = db.updateProject(created.id as string, renamed);
      assert.strictEqual(updated.name, renamed);
      assert.strictEqual(db.getProjectData(renamed)?.id, created.id);

      const remaining = db.deleteProject(created.id as string);
      assert.strictEqual(db.getProjectData(renamed), undefined);
      assert.ok(Array.isArray(remaining));
      assert.ok(!remaining.some((p: any) => p.id === created.id));
    });

    it('throws when updating an unknown project', () => {
      assert.throws(() => db.updateProject('unknown-id', 'x'), /not found/);
    });

    it('throws when deleting an unknown project', () => {
      assert.throws(() => db.deleteProject('unknown-id'), /not found/);
    });
  });

  describe('saveRoute / getSchemaData / deleteRoute', () => {
    it('saves a route, finds it and removes it', () => {
      const name = uniqueName('svc-route');
      const project = db.saveProject({ name, type: 'project', selected: false, status: true });
      const projectId = project.id as string;

      const route = db.saveRoute(projectId, {
        name: '/items',
        type: 'GET',
        schema: { title: 'title' },
      });
      assert.ok(route.id);
      assert.strictEqual(route.status, true);
      assert.strictEqual(route.selected, true);

      const exact = db.getSchemaData(name, 'GET', '/items');
      assert.ok(exact.routeData);
      assert.strictEqual(exact.routeData!.id, route.id);

      db.deleteRoute(projectId, route.id as string);
      const afterDelete = db.getSchemaData(name, 'GET', '/items');
      assert.strictEqual(afterDelete.routeData, null);

      db.deleteProject(projectId);
    });

    it('matches dynamic route segments with :params', () => {
      const name = uniqueName('svc-dynamic');
      const project = db.saveProject({ name, type: 'project', selected: false, status: true });
      const projectId = project.id as string;

      db.saveRoute(projectId, {
        name: '/users/:id',
        type: 'GET',
        schema: { id: 'uuid' },
      });

      const matched = db.getSchemaData(name, 'GET', '/users/123');
      assert.ok(matched.routeData);
      assert.strictEqual(matched.routeData!.name, '/users/:id');

      db.deleteProject(projectId);
    });

    it('returns null routeData for an unknown route', () => {
      const name = uniqueName('svc-unknown');
      const project = db.saveProject({ name, type: 'project', selected: false, status: true });
      const result = db.getSchemaData(name, 'GET', '/does-not-exist');
      assert.strictEqual(result.routeData, null);
      db.deleteProject(project.id as string);
    });

    it('throws when saving a route for an unknown project', () => {
      assert.throws(
        () => db.saveRoute('unknown-id', { name: '/x', type: 'GET', schema: {} }),
        /not found/
      );
    });
  });

  describe('getRouteData', () => {
    it('returns the route with projectId/projectName stamped', () => {
      const name = uniqueName('svc-routedata');
      const project = db.saveProject({ name, type: 'project', selected: false, status: true });
      const projectId = project.id as string;
      const route = db.saveRoute(projectId, {
        name: '/list',
        type: 'GET',
        schema: { title: 'title' },
      });

      const { routeData } = db.getRouteData(projectId, route.id as string);
      assert.ok(routeData);
      assert.strictEqual(routeData!.projectId, projectId);
      assert.strictEqual(routeData!.projectName, name);

      db.deleteProject(projectId);
    });

    it('throws for an unknown project', () => {
      assert.throws(() => db.getRouteData('unknown-id', 'route-id'), /not found/);
    });
  });
});

describe('ProjectService', () => {
  const service = new ProjectService();

  describe('getRouteData', () => {
    it('returns project list and a selected project', () => {
      const result = service.getRouteData();
      assert.ok(result);
      assert.ok(Array.isArray(result!.projectList));
      assert.ok(result!.selectedProject);
      assert.ok(result!.selectedProject!.id);
      assert.ok(Array.isArray(result!.routeList));
    });
  });

  describe('createProject', () => {
    it('creates a new project', () => {
      const name = uniqueName('svc-create');
      const project = service.createProject(name);
      assert.ok(project);
      assert.ok(project!.id);
      assert.strictEqual(project!.name, name);
      assert.strictEqual(project!.selected, true);
      assert.deepStrictEqual(project!.routes, []);
      service.deleteProject(project!.id as string);
    });

    it('returns null for a duplicate project name', () => {
      const name = uniqueName('svc-dup');
      const first = service.createProject(name);
      assert.ok(first);
      const second = service.createProject(name);
      assert.strictEqual(second, null);
      service.deleteProject(first!.id as string);
    });
  });

  describe('updateProject', () => {
    it('renames a project (name only)', () => {
      const name = uniqueName('svc-rename');
      const project = service.createProject(name);
      const updated = service.updateProject(project!.id as string, `${name}-updated`);
      assert.strictEqual(updated.name, `${name}-updated`);
      assert.strictEqual(updated.id, project!.id);
      service.deleteProject(project!.id as string);
    });
  });

  describe('deleteProject', () => {
    it('removes the project from the list', () => {
      const name = uniqueName('svc-delete');
      const project = service.createProject(name);
      service.deleteProject(project!.id as string);
      const remaining = service.getRouteData();
      assert.ok(!remaining!.projectList!.some((p: any) => p.id === project!.id));
    });
  });
});
