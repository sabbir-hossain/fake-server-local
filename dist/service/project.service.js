"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const database_service_1 = __importDefault(require("./database.service"));
class ProjectService {
    /**
     * Initializes the ProjectService with a new instance of DatabaseService.
     */
    constructor() {
        this.db = new database_service_1.default();
    }
    /**
     * Retrieves the list of all projects and the selected project.
     * @returns An object containing the project list and the selected project.
     */
    getRouteData(projectId) {
        let projectData = this.db.getAllProjects();
        let selectedProjectData = null;
        if (projectId) {
            selectedProjectData = projectData.find((project) => project.id === projectId) || null;
            if (selectedProjectData) {
                projectData = this.db.updateSelectedProjectById(projectId);
            }
        }
        else {
            selectedProjectData = projectData.find((project) => project.selected) || null;
        }
        if (!selectedProjectData) {
            return null;
        }
        const routeList = (selectedProjectData.routes || []).map((route) => ({
            name: route.name,
            selected: route.selected || false,
            id: route.id || undefined,
            type: route.type || '',
            status: route.status || false,
            projectId: (selectedProjectData === null || selectedProjectData === void 0 ? void 0 : selectedProjectData.id) || '',
            projectName: (selectedProjectData === null || selectedProjectData === void 0 ? void 0 : selectedProjectData.name) || '',
        }));
        const selectedRoute = routeList.find((route) => route.selected) || undefined;
        const projectList = projectData.map((project) => ({
            name: project.name,
            selected: project.selected,
            id: project.id,
            status: project.status || false,
        }));
        const selectedProject = {
            name: selectedProjectData.name,
            selected: selectedProjectData.selected,
            id: selectedProjectData.id,
            status: selectedProjectData.status || false,
        };
        return { projectList, selectedProject, routeList, selectedRoute };
    }
    createProject(name) {
        // Check if project with the same name already exists
        const existingProject = this.db.getAllProjects().find(project => project.name === name);
        if (existingProject) {
            console.error(`Project with name ${name} already exists.`);
            return null;
        }
        // Create a new project object
        const newProject = {
            name,
            type: 'project',
            selected: true,
            status: true,
        };
        return this.db.saveProject(newProject);
    }
}
exports.ProjectService = ProjectService;
