import "reflect-metadata";
import { useExpressServer } from "routing-controllers";
import express from "express";
import path from "path";

// import { ErrorHandler } from "./middleware/errorHandler";
import { HealthController } from "./controllers/healthController";
import DataController from "./controllers/dataController";
import ProjectController from "./controllers/projectController";
import RouteController from "./controllers/routeController";
import { ViewController } from "./controllers/viewController";

export const app = express();

// 1. static first
app.use(express.static(path.join(__dirname, "..", "public")));

// 2. then routing-controllers
useExpressServer(app, {
  cors: true,
  controllers: [
    ViewController,
    HealthController,
    ProjectController,
    RouteController,
    DataController
  ],
  // middlewares: [ErrorHandler],
  // defaultErrorHandler: false,
  // validation: true,
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
