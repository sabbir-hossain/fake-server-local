
import { Request, Response } from 'express';
import DatabaseService from '../service/database.service';
import { StatusCodes } from '../types/type';
import { process } from '../lib/generator';

export default class ProjectController {

    static databaseService: DatabaseService  = new DatabaseService();
    static reserveRouteList: string[] = [
        'vendor',
        '.well-known',
    ];

    /**
     * Handles all requests to the project endpoint.
     * @param request - The incoming request object.
     * @param response - The response object to send data back.
     */
    static handleProjectRequest(req: Request, res: Response): Response {
        if( ProjectController.reserveRouteList.includes(req.params.project) ) {
            return res.status(404).send({
                message: `Project ${req.params.project} is reserved and cannot be accessed.`
            });
        }

        const {routeData, secret} = ProjectController.databaseService.getSchemaData(
          req.params.project, 
          req.method, 
          `/${req.params[0]}`
        );

        if (!routeData) {
            return res.status(400).send({
                message: `Route ${req.params[0]} not found in project ${req.params.project}.`,
            });
        }

        const { schema } = routeData || {};

        const schemaData: any = {
            __output: schema,
        };

        const data: any = process(schemaData, {}, { secret });

        return res.status(StatusCodes.OK).send(data.__output);
    }
}
