
import { Request, Response } from 'express';
import DatabaseService from '../service/database.service';
import { StatusCodes } from '../types/type';
import { process } from '../lib/generator';
import { All, JsonController, Req, Res } from 'routing-controllers';


@JsonController('/:projectName((?!__).+)')
export default class DataController {

    public databaseService: DatabaseService;
    public reserveRouteList: string[] = [
        'vendor',
        '.well-known',
        'css',
        'js',
        'images',
        'favicon.ico',
        'favicon.png',
    ];

    constructor(dbService: DatabaseService = new DatabaseService()) {
        this.databaseService = dbService;
    }

    /**
     * Handles all requests to the project endpoint.
     * @param request - The incoming request object.
     * @param response - The response object to send data back.
     */
    @All('/*')
    public handleProjectRequest(@Req() req: Request, @Res() res: Response): Response {
        if( this.reserveRouteList.includes(req.params.projectName) ) {
            return res.send({
                message: `Project ${req.params.projectName} is reserved and cannot be accessed.`
            });
        }

        const {routeData, secret} = this.databaseService.getSchemaData(
          req.params.projectName, 
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

// export default new ProjectController();
