"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_service_1 = __importDefault(require("../service/database.service"));
const type_1 = require("../types/type");
const generator_1 = require("../lib/generator");
class ProjectController {
    /**
     * Handles all requests to the project endpoint.
     * @param request - The incoming request object.
     * @param response - The response object to send data back.
     */
    static handleProjectRequest(req, res) {
        if (ProjectController.reserveRouteList.includes(req.params.project)) {
            return res.status(404).send({
                message: `Project ${req.params.project} is reserved and cannot be accessed.`
            });
        }
        const { routeData, secret } = ProjectController.databaseService.getSchemaData(req.params.project, req.method, `/${req.params[0]}`);
        if (!routeData) {
            return res.status(400).send({
                message: `Route ${req.params[0]} not found in project ${req.params.project}.`,
            });
        }
        const { schema } = routeData || {};
        const schemaData = {
            __output: schema,
        };
        const data = (0, generator_1.process)(schemaData, {}, { secret });
        return res.status(type_1.StatusCodes.OK).send(data.__output);
    }
}
ProjectController.databaseService = new database_service_1.default();
ProjectController.reserveRouteList = [
    'vendor',
    '.well-known',
];
exports.default = ProjectController;
