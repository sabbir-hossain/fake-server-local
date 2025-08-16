const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/store.json'), 'utf8'));

class Database {

  db;

  constructor() {
    if(typeof data === 'object' && Array.isArray(data)) {
      this.db = data;
    } else {
      this.db = [];
    }
  }

  getProjectData(projectName) {
    const result = this.db.find((item) => item.name === projectName);
    return result; // Explicit return type
  }

  updateSelectedProjectById(projectId) {
    this.db = this.db.map((item) => ({ ...item, selected: item.id === projectId }));
    this.saveData();
    const result = this.db.find((item) => item.id === projectId);
    return result; // Explicit return type
  }

  getRouteData(projectId, routeId) {
    const project = this.db.find((item) => item.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    project.routes = project.routes.map((route) => ({
      ...route,
      selected: route.id === routeId,
    }));
    const routeData = project.routes.find((route) => route.id === routeId);
    this.saveData();
    return { routeData, secret: project.secret, routes: project.routes };
  }


  getSchemaData (projectName, routeType, routeName) {
    const project = this.db.find((item) => item.name === projectName);
    if (!project) {
      throw new Error(`Project ${projectName} not found`);
    }

    const routeInfo = (project.routes || []).find((route) => route.type === routeType && route.
    name === routeName);

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
  }


  getAllRoutes(projectId, active = true) {
    const project = this.db.find((item) => item.id === projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    const routes = project.routes || [];
    if (active) {
      const routes = project.routes || [];
      return routes.filter((route) => route.status);
    } else {
      return routes;
    }
  }

  updateRoute(projectId, routeData) {
    const project = this.db.find((item) => item.id === projectId);
    if (project) {
      routeData.updatedAt = Date.now();
      project.routes = project.routes || [];
      const routeIndex = project.routes.findIndex((route) => route.id === routeData.id);
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



  saveProject (project) {
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


  saveRoute(projectId, routeData) {
    const project = this.db.find((item) => item.id === projectId);
    if (project) {
      project.updatedAt = Date.now();
      routeData.id = uuidGenerator();
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

  deleteRoute(projectId, routeId) {
    const project = this.db.find((item) => item.id === projectId);
    if (project) {
      project.updatedAt = Date.now();
      project.routes = project.routes.filter((route) => route.id !== routeId);
      this.saveData();
    } else {
      throw new Error(`Project ${projectId} not found`);
    }
  }
  saveData() {
    try {
      fs.writeFileSync(
      path.join(__dirname, '../data/store.json'), 
      JSON.stringify(this.db, undefined, 2), 
      'utf-8'
      );

      this.db = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/store.json'), 'utf8'));
    } catch (error) {
      console.error('Error saving database:: ', error);
    }
  }
}

module.exports = Database;
