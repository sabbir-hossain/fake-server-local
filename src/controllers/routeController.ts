import { Request, Response } from 'express';
import { BadRequestError, Body, Controller, Get, JsonController, Post, Req, Res } from 'routing-controllers';

import DatabaseService from '../service/database.service';
import { ProjectService } from '../service/project.service';
import { StatusCodes, ViewResponse } from '../types/type';

@JsonController('/__route')
export default class RouteController {

  private projectService: ProjectService;
  private databaseService: DatabaseService;

  constructor(
    projectService: ProjectService = new ProjectService(),
    databaseService: DatabaseService = new DatabaseService()
  ) {
    this.projectService = projectService;
    this.databaseService = databaseService;
  } 

  @Get('/:projectId/list')
  public getRouteList(@Req() req: Request, @Res() res: Response): Response {
    const { projectId } = req.params;
    try {
        const result: ViewResponse | null = this
              .projectService.getRouteData(projectId);
        return res.status(200).send(result?.routeList || []);
    } catch (error) {
        console.error('Error retrieving project:', error);
        return res.status(400).send(error);
    }
  }

  @Post('/save')
  saveRoute(@Body() requestBody: any): any  {
      const { projectId,  ...routeData} = requestBody;
      console.log('requestBody', requestBody);
      // console.log('routeData', req.body);
      // console.log('body : ', res.body);
    // Manual validation
      if (!projectId || typeof projectId !== 'string') {
        throw new BadRequestError('Invalid request: projectId is required and must be a string');
      }

      if (!routeData.name || !routeData.type || !routeData.schema) {
          throw new BadRequestError('Name, type, and schema are required');
      }
      try {
          return this.databaseService.saveRoute (projectId, routeData);
      } catch (error) {
          console.error('Error saving route:', error);
          throw new BadRequestError('Error saving route');
      }
  }
}
