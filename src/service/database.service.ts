import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import data from '../data/store.json';
import { Project, Route, RouteResponse } from '../types/type';

export default class DatabaseService {

  private db: any[];

  constructor() {
    if(typeof data === 'object' && Array.isArray(data)) {
      this.db = data;
    } else {
      this.db = [];
    }
  }
  
  public getAllProjects(): Project[] {
    return this.db.filter((item) => item.type === 'project');
  }

  public getProjectData(projectName: string): Project | undefined {
    const result = this.db.find((item) => item.name === projectName);
    return result; // Explicit return type
  }

  public updateSelectedProjectById(projectId: string): Project[] {
    this.db = this.db.map((item) => ({ ...item, selected: item.id === projectId }));
    this.saveData();
    return this.getAllProjects(); // Explicit return type
  }

  public getRouteData(projectId: string, routeId: string): RouteResponse {
    const project = this.db.find((item) => item.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    project.routes = project.routes.map((route: any) => ({
      ...route,
      selected: route.id === routeId,
      projectId: project?.id || '',
      projectName: project?.name || '',
    }));
    const routeData = project.routes.find((route: any) => route.id === routeId);
    this.saveData();
    return { routeData, secret: project.secret, routes: project.routes };
  }


  public getSchemaData (projectName: string, routeType: string, routeName: string): RouteResponse {
    const project = this.db.find((item) => item.name === projectName);
    if (!project) {
      throw new Error(`Project ${projectName} not found`);
    }

    const routeInfo = (project.routes || []).find((route: any) => route.type === routeType && route.name === routeName);

    if(routeInfo) {
      return { routeData: routeInfo, secret: project.secret };
    }

    const routeArray = routeName.split('/');
    let routeData = null;
    for(const route of project.routes || []) {
      if (route.type === routeType) {
        const routePathArray = route.name.split('/');
        let routeFound = true;
        for(let i = 0; i<routeArray.length; i++) {
          if (routePathArray[i][0] !== ':' && routePathArray[i] !== routeArray[i]) {
            routeFound = false;
            break;
          }
        }

        if (routeFound) {
          routeData = route;
          break;
        }
      }
    }

    return { routeData, secret: project.secret };
  }


  public getAllRoutes(projectId: string, active: boolean = true): Route[] {
    const project = this.db.find((item) => item.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    const routes = project.routes || [];
    if (active) {
      const routes = project.routes || [];
      return routes.filter((route: any) => route.status);
    } else {
      return routes;
    }
  }

  public updateRoute(projectId: string, routeData: Route): Route {
    const project = this.db.find((item) => item.id === projectId);
    if (project) {
      routeData.updatedAt = Date.now();
      project.routes = project.routes || [];
      const routeIndex = project.routes.findIndex((route: Route) => route.id === routeData.id);
      if (routeIndex !== -1) {
        project.routes[routeIndex] = routeData;
      } else {
        project.routes.push(routeData);
      }
      project.updatedAt = Date.now();
      this.saveData();
      return routeData; // Explicit return type
    } else {
      throw new Error(`Project ${projectId} not found`);
    }
  }

  public saveProject (project: Project): Project {
    project.id = uuidv4();
    project.createdAt = Date.now();
    project.updatedAt = Date.now();
    project.secret = project.secret || 'super-secret'
    project.routes = [];

    this.db.push(project);
    this.db = this.db.map((item) => ({ 
      ...item, 
      selected: item.name === project.name
    }));

    this.saveData();
    return project; // Explicit return type
  }


  public saveRoute(projectId: string, routeData: Route): Route {
    const project = this.db.find((item) => item.id === projectId);
    if (project) {
      project.updatedAt = Date.now();
      routeData.id = uuidv4();
      routeData.status = true; // Ensure the route is active by default
      routeData.selected = true;
      routeData.createdAt = Date.now();
      routeData.updatedAt = Date.now();
      project.routes = project.routes || [];
      project.routes.push(routeData);
      this.saveData();
      return routeData; // Explicit return type
    } else {
      throw new Error(`Project ${projectId} not found`);
    }
  }

  public deleteRoute(projectId: string, routeId: string): void {
    const project = this.db.find((item) => item.id === projectId);
    if (project) {
      project.updatedAt = Date.now();
      project.routes = project.routes.filter((route: any) => route.id !== routeId);
      this.saveData();
    } else {
      throw new Error(`Project ${projectId} not found`);
    }
  }

  public saveData(): void {
    try {
      fs.writeFileSync(
        path.join(__dirname, '../data/store.json'), 
        JSON.stringify(this.db, undefined, 2), 
        'utf-8'
      );

      // this.db = JSON.parse(
      //   fs.readFileSync(path.join(__dirname, '../data/store.json'), 'utf8')
      // );
    } catch (error) {
      console.error('Error saving database:: ', error);
    }
  }
  
}
