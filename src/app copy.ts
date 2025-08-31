import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRoutes from './route'; // Import the API routes
import { Server } from 'http'; // Import the Server type from the 'http' module
import path from 'path';

class App {
  public app: Application;
  public port: string | number;

  constructor(port: string | number) {
    this.app = express();
    this.port = port;
    // EJS setup
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, '../public'));
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(helmet());
    dotenv.config();
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  private configureRoutes(): void {
    // Sample EJS route
    this.app.get('/dashboard', (req: Request, res: Response) => {
      res.render('layout', {
        projectUrl: `http://localhost:${this.port}`,
      });
    });

    // Use API routes
    this.app.use('/', apiRoutes);
  }

  private configureErrorHandling(): void {
    // Global error handler
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });
  }

  // The key change is here: We now return the result of this.app.listen()
  public listen(): Server {
    const server = this.app.listen(this.port, () => {
      // We don't need to log here anymore as the event listener in server.ts handles it.
    });
    return server;
  }
}

export default App;
