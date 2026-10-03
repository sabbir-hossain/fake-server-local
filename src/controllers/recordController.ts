import { Request, Response } from 'express';
import DatabaseService from '../service/database.service';
import { ProjectService } from '../service/project.service';
import { Route, RouteResponse, StatusCodes, ViewResponse } from '../types/type';


export default class RecordController {

  static projectService: ProjectService = new ProjectService();
  static databaseService: DatabaseService = DatabaseService.getInstance();

  static reservedProjectNames: string[] = ['health-check', '__project', '__route'];

  static isReservedProjectName(name: string): boolean {
    return RecordController.reservedProjectNames.includes(name);
  }

  static getInitialData(req: Request, res: Response): Response {
    const result = RecordController.projectService.getRouteData();
 
    return res.status(200).json({
        projectList: result?.projectList || [],
        selectedProject: result?.selectedProject || {},
        routeList: result?.routeList || [],
        selectedRoute: result?.selectedRoute || {},
    });
  }

  static createProject(req: Request, res: Response): Response {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Invalid project name' });
    }
    if (RecordController.isReservedProjectName(name)) {
      return res.status(400).json({ message: `Project name "${name}" is reserved` });
    }
    const result = RecordController.projectService.createProject(name);
    if (result) {
      return res.status(201).json(result);
    } else {
      return res.status(500).json({ message: 'Failed to create project' });
    }
  }

  static updateProject(req: Request, res: Response): Response {
    const { projectId } = req.params;
    const { name } = req.body;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Valid projectId is required' });
    }
    if (!name || typeof name !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Valid project name is required' });
    }
    if (RecordController.isReservedProjectName(name)) {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: `Project name "${name}" is reserved` });
    }
    try {
        const result = RecordController.projectService.updateProject(projectId, name);
        return res.status(StatusCodes.OK).send(result);
    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(StatusCodes.BAD_REQUEST).send({ message: error instanceof Error ? error.message : 'Failed to update project' });
    }
  }

  static deleteProject(req: Request, res: Response): Response {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Valid projectId is required' });
    }
    try {
        const result = RecordController.projectService.deleteProject(projectId);
        return res.status(StatusCodes.OK).send(result);
    } catch (error) {
        console.error('Error deleting project:', error);
        return res.status(StatusCodes.BAD_REQUEST).send({ message: error instanceof Error ? error.message : 'Failed to delete project' });
    }
  }

  static getRouteList(req: Request, res: Response): Response {
    const { projectId } = req.params;
    try {
        const result: ViewResponse | null = RecordController
              .projectService.getRouteData(projectId);
        return res.status(200).send(result?.routeList || []);
    } catch (error) {
        console.error('Error retrieving project:', error);
        return res.status(400).send({ message: error instanceof Error ? error.message : 'Failed to retrieve routes' });
    }
  }

  static saveRoute (req: Request, res: Response): Response {
      const { projectId,  ...routeData} = req.body;
      if(!projectId || typeof projectId !== 'string') {
          return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Valid projectId is required' });
      }

      if (!routeData.name || !routeData.type || !routeData.schema) {
          return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Name, type, and schema are required' });
      }
      try {
          const result = RecordController.databaseService.saveRoute (projectId, routeData);
          return res.status(StatusCodes.OK).send(result);
      } catch (error) {
          console.error('Error saving route:', error);
          return res.status(StatusCodes.BAD_REQUEST).send({ message: error instanceof Error ? error.message : 'Failed to save route' });
      }
  }

  static updateRoute(req: Request, res: Response): Response {
    const { projectId, routeId } = req.params;

    const { name, type } = req.body;
    if (!name || !type) {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Name, type, and schema are required' });
    }

    req.body.id = routeId;
    try {
      const result: Route = RecordController.databaseService.updateRoute(projectId, req.body);
      return res.status(StatusCodes.OK).send(result);
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).send({ message: error instanceof Error ? error.message : 'Failed to update route' });
    }
  }

  static getRouteData(req: Request, res: Response): Response {
    const { projectId, routeId } = req.params;
    try {
      const {routeData}: RouteResponse = RecordController.databaseService.getRouteData(projectId, routeId);
      if (!routeData) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: 'Route not found' });
      }
      return res.status(StatusCodes.OK).send(routeData);
    } catch (error) {
      console.error(error);
      return res.status(StatusCodes.BAD_REQUEST).send({ message: error instanceof Error ? error.message : 'Failed to retrieve route' });
    }
  }

  static removeRoute(req: Request, res: Response): Response {
      const { projectId, routeId } = req.params;
      try {
          RecordController.databaseService.deleteRoute (projectId, routeId);
          const {routes, routeData}: RouteResponse = RecordController.databaseService.getRouteData(projectId, routeId);
          return res.status(StatusCodes.OK).send({
              message: 'Route deleted successfully',
              data: {
                  routes,
                  selectedRoute: routeData,
              },
          });
      } catch (error) {
          return res.status(StatusCodes.BAD_REQUEST).send({ message: error instanceof Error ? error.message : 'Failed to delete route' });
      }
  }

  static getProjectData(req: Request, res: Response): Response {
    const { projectId } = req.params;
    if(!projectId || typeof projectId !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Valid projectId is required' });
    }
    const result = RecordController.projectService.getRouteData(projectId);
    return res.status(200).json({
        projectList: result?.projectList || [],
        selectedProject: result?.selectedProject || {},
        routeList: result?.routeList || [],
        selectedRoute: result?.selectedRoute || {},
    });
  }
}
