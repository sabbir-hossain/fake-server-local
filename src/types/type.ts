export interface Schema {
    __index?: number;
    __type?: string;
    __range?: string;
    __property?: {
        [key: string]: string;
    };
};

export interface ObjectSchemaOption {
    [key: string]: any;
    __index?: number;
    __type?: string;
    __range?: string;
    __property?: {
        [key: string]: string|number|boolean|object;
    };
};

export interface Route {
    id?: string;
    type?: string;
    name?: string;
    schema?: ObjectSchemaOption; 
    status?: boolean;
    updatedAt?: number;
    createdAt?: number;
    selected?: boolean;
}

export interface Project {
    id?: string;
    name?: string;
    status?: boolean;
    type?: string; 
    secret?: string;
    selected?: boolean;
    updatedAt?: number;
    createdAt?: number;
    routes?: Route[];
}

export interface RouteResponse {
    routeData: Route | undefined;
    secret?: string;
    routes?: Route[];
}

export interface Project {
    id?: string;
    name?: string;
    status?: boolean;
    type?: string; 
    secret?: string;
    selected?: boolean;
    updatedAt?: number;
    createdAt?: number;
    routes?: Route[];
}

export interface RouteResponse {
    routeData: Route | undefined;
    secret?: string;
    routes?: Route[];
}

export interface ViewResponse {
    projectList?: Project[] | undefined;
    selectedProject?: Project;
    routeList?: Route[] | undefined;
    selectedRoute?: Route;
}

export enum StatusCodes {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export interface Params {
    [key: string]: string|number|boolean|object;
}

export interface Options {
    secret?: string;
    expiresIn?: number;
}
