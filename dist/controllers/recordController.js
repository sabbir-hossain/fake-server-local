"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_service_1 = __importDefault(require("../service/database.service"));
const project_service_1 = require("../service/project.service");
const type_1 = require("../types/type");
class RecordController {
    static getInitialData(req, res) {
        const result = RecordController.projectService.getRouteData();
        return res.status(200).json({
            projectList: (result === null || result === void 0 ? void 0 : result.projectList) || [],
            selectedProject: (result === null || result === void 0 ? void 0 : result.selectedProject) || {},
            routeList: (result === null || result === void 0 ? void 0 : result.routeList) || [],
            selectedRoute: (result === null || result === void 0 ? void 0 : result.selectedRoute) || {},
        });
    }
    static createProject(req, res) {
        const { name } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: 'Invalid project name' });
        }
        const result = RecordController.projectService.createProject(name);
        if (result) {
            return res.status(201).json(result);
        }
        else {
            return res.status(500).json({ message: 'Failed to create project' });
        }
    }
    static getRouteList(req, res) {
        const { projectId } = req.params;
        try {
            const result = RecordController
                .projectService.getRouteData(projectId);
            return res.status(200).send((result === null || result === void 0 ? void 0 : result.routeList) || []);
        }
        catch (error) {
            console.error('Error retrieving project:', error);
            return res.status(400).send(error);
        }
    }
    static saveRoute(req, res) {
        const _a = req.body, { projectId } = _a, routeData = __rest(_a, ["projectId"]);
        if (!projectId || typeof projectId !== 'string') {
            return res.status(type_1.StatusCodes.BAD_REQUEST).send({ message: 'Valid projectId is required' });
        }
        if (!routeData.name || !routeData.type || !routeData.schema) {
            return res.status(type_1.StatusCodes.BAD_REQUEST).send({ message: 'Name, type, and schema are required' });
        }
        try {
            const result = RecordController.databaseService.saveRoute(projectId, routeData);
            return res.status(type_1.StatusCodes.OK).send(result);
        }
        catch (error) {
            console.error('Error saving route:', error);
            return res.status(type_1.StatusCodes.BAD_REQUEST).send(error);
        }
    }
    static updateRoute(req, res) {
        const { projectId, routeId } = req.params;
        const { name, type } = req.body;
        if (!name || !type) {
            return res.status(type_1.StatusCodes.BAD_REQUEST).send({ message: 'Name, type, and schema are required' });
        }
        req.body.id = routeId;
        try {
            const result = RecordController.databaseService.updateRoute(projectId, req.body);
            return res.status(type_1.StatusCodes.OK).send(result);
        }
        catch (error) {
            return res.status(type_1.StatusCodes.BAD_REQUEST).send(error);
        }
    }
    static getRouteData(req, res) {
        const { projectId, routeId } = req.params;
        try {
            const { routeData } = RecordController.databaseService.getRouteData(projectId, routeId);
            if (!routeData) {
                return res.status(type_1.StatusCodes.NOT_FOUND).send({ message: 'Route not found' });
            }
            return res.status(type_1.StatusCodes.OK).send(routeData);
        }
        catch (error) {
            console.error(error);
            return res.status(type_1.StatusCodes.BAD_REQUEST).send(error);
        }
    }
    static removeRoute(req, res) {
        const { projectId, routeId } = req.params;
        try {
            RecordController.databaseService.deleteRoute(projectId, routeId);
            const { routes, routeData } = RecordController.databaseService.getRouteData(projectId, routeId);
            return res.status(type_1.StatusCodes.OK).send({
                message: 'Route deleted successfully',
                data: {
                    routes,
                    selectedRoute: routeData,
                },
            });
        }
        catch (error) {
            return res.status(type_1.StatusCodes.BAD_REQUEST).send(error);
        }
    }
    static getProjectData(req, res) {
        const { projectId } = req.params;
        if (!projectId || typeof projectId !== 'string') {
            return res.status(type_1.StatusCodes.BAD_REQUEST).send({ message: 'Valid projectId is required' });
        }
        const result = RecordController.projectService.getRouteData(projectId);
        return res.status(200).json({
            projectList: (result === null || result === void 0 ? void 0 : result.projectList) || [],
            selectedProject: (result === null || result === void 0 ? void 0 : result.selectedProject) || {},
            routeList: (result === null || result === void 0 ? void 0 : result.routeList) || [],
            selectedRoute: (result === null || result === void 0 ? void 0 : result.selectedRoute) || {},
        });
    }
}
RecordController.projectService = new project_service_1.ProjectService();
RecordController.databaseService = new database_service_1.default();
exports.default = RecordController;
