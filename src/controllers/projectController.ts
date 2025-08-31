import { Request, Response } from 'express';
import { Body, Controller, Delete, Get, JsonController, Post, Put, Req, Res } from 'routing-controllers';
import DatabaseService from '../service/database.service';
import { ProjectService } from '../service/project.service';
import { Route, RouteResponse, StatusCodes, ViewResponse } from '../types/type';

@Controller('/__project')
export default class ProjectController {

  private projectService: ProjectService;
  private databaseService: DatabaseService;

  constructor(
    projectService: ProjectService = new ProjectService(),
    databaseService: DatabaseService = new DatabaseService()
  ) {
    this.projectService = projectService;
    this.databaseService = databaseService;
  } 

  @Get('/list')
  public getInitialData(@Req() req: Request, @Res() res: Response): Response {
    const result = this.projectService.getRouteData();
 
    return res.status(200).json({
        projectList: result?.projectList || [],
        selectedProject: result?.selectedProject || {},
        routeList: result?.routeList || [],
        selectedRoute: result?.selectedRoute || {},
    });
  }

  @Post('/create')
  public createProject(req: Request, @Body() requestBody: any,  res: Response): Response {
    const { name } = requestBody;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Invalid project name' });
    }
    const result = this.projectService.createProject(name);
    if (result) {
      return res.status(201).json(result);
    } else {
      return res.status(500).json({ message: 'Failed to create project' });
    }
  }

  @Put('/:projectId/route/:routeId/update')
  public updateRoute(@Req() req: Request, @Body() requestBody: any, @Res() res: Response): Response {
    const { projectId, routeId } = req.params;

    const { name, type } = req.body;
    if (!name || !type) {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Name, type, and schema are required' });
    }

    req.body.id = routeId;
    try {
      const result: Route = this.databaseService.updateRoute(projectId, req.body);
      return res.status(StatusCodes.OK).send(result);
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).send(error);
    }
  }

  @Get('/:projectId/route/:routeId')
  public getRouteData(@Req() req: Request, @Res() res: Response): Response {
    const { projectId, routeId } = req.params;
    try {
      const {routeData}: RouteResponse = this.databaseService.getRouteData(projectId, routeId);
      if (!routeData) {
      return res.status(StatusCodes.NOT_FOUND).send({ message: 'Route not found' });
      }
      return res.status(StatusCodes.OK).send(routeData);
    } catch (error) {
      console.error(error);
      return res.status(StatusCodes.BAD_REQUEST).send(error);
    }
  }

  @Delete('/:projectId/route/:routeId/delete')
  public removeRoute(@Req() req: Request, @Res() res: Response): Response {
      const { projectId, routeId } = req.params;
      try {
          this.databaseService.deleteRoute (projectId, routeId);
          const {routes, routeData}: RouteResponse = this.databaseService.getRouteData(projectId, routeId);
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

  @Get('/:projectId/switch')
  public getProjectData(req: Request, res: Response): Response {
    const { projectId } = req.params;
    if(!projectId || typeof projectId !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).send({ message: 'Valid projectId is required' });
    }
    const result = this.projectService.getRouteData(projectId);
    return res.status(200).json({
        projectList: result?.projectList || [],
        selectedProject: result?.selectedProject || {},
        routeList: result?.routeList || [],
        selectedRoute: result?.selectedRoute || {},
    });
  }
}
