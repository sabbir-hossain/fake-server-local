import { Request, Response } from 'express';
import DatabaseService from '../service/database.service';
import { ProjectService } from '../service/project.service';
import { Route, RouteResponse, StatusCodes, ViewResponse } from '../types/type';


export default class RecordController {

  static projectService: ProjectService = new ProjectService();
  static databaseService: DatabaseService = new DatabaseService();

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
    const result = RecordController.projectService.createProject(name);
    if (result) {
      return res.status(201).json(result);
    } else {
      return res.status(500).json({ message: 'Failed to create project' });
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
        return res.status(400).send(error);
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
          return res.status(StatusCodes.BAD_REQUEST).send(error);
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
      return res.status(StatusCodes.BAD_REQUEST).send(error);
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
      return res.status(StatusCodes.BAD_REQUEST).send(error);
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
          return res.status(StatusCodes.BAD_REQUEST).send(error);
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
