"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const store_json_1 = __importDefault(require("../data/store.json"));
class DatabaseService {
    constructor() {
        if (typeof store_json_1.default === 'object' && Array.isArray(store_json_1.default)) {
            this.db = store_json_1.default;
        }
        else {
            this.db = [];
        }
    }
    getAllProjects() {
        return this.db.filter((item) => item.type === 'project');
    }
    getProjectData(projectName) {
        const result = this.db.find((item) => item.name === projectName);
        return result; // Explicit return type
    }
    updateSelectedProjectById(projectId) {
        this.db = this.db.map((item) => (Object.assign(Object.assign({}, item), { selected: item.id === projectId })));
        this.saveData();
        return this.getAllProjects(); // Explicit return type
    }
    getRouteData(projectId, routeId) {
        const project = this.db.find((item) => item.id === projectId);
        if (!project) {
            throw new Error(`Project ${projectId} not found`);
        }
        project.routes = project.routes.map((route) => (Object.assign(Object.assign({}, route), { selected: route.id === routeId, projectId: (project === null || project === void 0 ? void 0 : project.id) || '', projectName: (project === null || project === void 0 ? void 0 : project.name) || '' })));
        const routeData = project.routes.find((route) => route.id === routeId);
        this.saveData();
        return { routeData, secret: project.secret, routes: project.routes };
    }
    getSchemaData(projectName, routeType, routeName) {
        const project = this.db.find((item) => item.name === projectName);
        if (!project) {
            throw new Error(`Project ${projectName} not found`);
        }
        const routeInfo = (project.routes || []).find((route) => route.type === routeType && route.name === routeName);
        if (routeInfo) {
            return { routeData: routeInfo, secret: project.secret };
        }
        const routeArray = routeName.split('/');
        let routeData = null;
        for (const route of project.routes || []) {
            if (route.type === routeType) {
                const routePathArray = route.name.split('/');
                let routeFound = true;
                for (let i = 0; i < routeArray.length; i++) {
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
    getAllRoutes(projectId, active = true) {
        const project = this.db.find((item) => item.id === projectId);
        if (!project) {
            throw new Error(`Project ${projectId} not found`);
        }
        const routes = project.routes || [];
        if (active) {
            const routes = project.routes || [];
            return routes.filter((route) => route.status);
        }
        else {
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
            }
            else {
                project.routes.push(routeData);
            }
            project.updatedAt = Date.now();
            this.saveData();
            return routeData; // Explicit return type
        }
        else {
            throw new Error(`Project ${projectId} not found`);
        }
    }
    saveProject(project) {
        project.id = (0, uuid_1.v4)();
        project.createdAt = Date.now();
        project.updatedAt = Date.now();
        project.secret = project.secret || 'super-secret';
        project.routes = [];
        this.db.push(project);
        this.db = this.db.map((item) => (Object.assign(Object.assign({}, item), { selected: item.name === project.name })));
        this.saveData();
        return project; // Explicit return type
    }
    saveRoute(projectId, routeData) {
        const project = this.db.find((item) => item.id === projectId);
        if (project) {
            project.updatedAt = Date.now();
            routeData.id = (0, uuid_1.v4)();
            routeData.status = true; // Ensure the route is active by default
            routeData.selected = true;
            routeData.createdAt = Date.now();
            routeData.updatedAt = Date.now();
            project.routes = project.routes || [];
            project.routes.push(routeData);
            this.saveData();
            return routeData; // Explicit return type
        }
        else {
            throw new Error(`Project ${projectId} not found`);
        }
    }
    deleteRoute(projectId, routeId) {
        const project = this.db.find((item) => item.id === projectId);
        if (project) {
            project.updatedAt = Date.now();
            project.routes = project.routes.filter((route) => route.id !== routeId);
            this.saveData();
        }
        else {
            throw new Error(`Project ${projectId} not found`);
        }
    }
    saveData() {
        try {
            fs.writeFileSync(path.join(__dirname, '../data/store.json'), JSON.stringify(this.db, undefined, 2), 'utf-8');
            // this.db = JSON.parse(
            //   fs.readFileSync(path.join(__dirname, '../data/store.json'), 'utf8')
            // );
        }
        catch (error) {
            console.error('Error saving database:: ', error);
        }
    }
}
exports.default = DatabaseService;
