"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const route_1 = __importDefault(require("./route")); // Import the API routes
const path_1 = __importDefault(require("path"));
class App {
    constructor(port) {
        this.app = (0, express_1.default)();
        this.port = port;
        // EJS setup
        this.app.set('view engine', 'ejs');
        this.app.set('views', path_1.default.join(__dirname, '../public'));
        this.configureMiddleware();
        this.configureRoutes();
        this.configureErrorHandling();
    }
    configureMiddleware() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.app.use((0, cors_1.default)());
        this.app.use((0, helmet_1.default)());
        dotenv_1.default.config();
        this.app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
    }
    configureRoutes() {
        // Sample EJS route
        this.app.get('/dashboard', (req, res) => {
            res.render('layout', {
                projectUrl: `http://localhost:${this.port}`,
            });
        });
        // Use API routes
        this.app.use('/', route_1.default);
    }
    configureErrorHandling() {
        // Global error handler
        this.app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });
    }
    // The key change is here: We now return the result of this.app.listen()
    listen() {
        const server = this.app.listen(this.port, () => {
            // We don't need to log here anymore as the event listener in server.ts handles it.
        });
        return server;
    }
}
exports.default = App;
