import { Project, Route, ViewResponse } from "../types/type";
import DatabaseService from "./database.service";

export class ProjectService {
    private db: DatabaseService;
    /**
     * Initializes the ProjectService with a new instance of DatabaseService.
     */
    public constructor() {
        this.db = new DatabaseService();
    }
    /**
     * Retrieves the list of all projects and the selected project.
     * @returns An object containing the project list and the selected project.
     */
    public getRouteData(projectId?: string): ViewResponse | null {
        let projectData: Project[] = this.db.getAllProjects();
        let selectedProjectData: Project | null = null;
        if(projectId) {
            selectedProjectData =  projectData.find((project) => project.id === projectId) || null;
            if(selectedProjectData) {
               projectData = this.db.updateSelectedProjectById(projectId);
            }
        } else {
            selectedProjectData = projectData.find((project) => project.selected) || null;
        }
        if(!selectedProjectData) {
            return null;
        }

        const routeList = (selectedProjectData.routes || []).map((route: Route) => ({
            name: route.name,
            selected: route.selected || false,
            id: route.id || undefined,
            type: route.type || '',
            status: route.status || false,
            projectId: selectedProjectData?.id || '',
            projectName: selectedProjectData?.name || '',
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
        return { projectList, selectedProject, routeList, selectedRoute } as ViewResponse;
    }

    public createProject(name: string): Project | null {
        // Check if project with the same name already exists
        const existingProject = this.db.getAllProjects().find(project => project.name === name);
        if (existingProject) {
            console.error(`Project with name ${name} already exists.`);
            return null;
        }

        // Create a new project object
        const newProject: Project = {
            name,
            type: 'project',
            selected: true,
            status: true,
        };

        return this.db.saveProject(newProject);
    }

}