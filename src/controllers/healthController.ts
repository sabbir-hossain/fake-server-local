import { Request, Response } from 'express';
/**
 * HealthController handles health check requests.
 */
class HealthController {
  /**
   * Checks the health of the server.
   * @returns A message indicating the server is up and running.
   */
  public checkHealth(req: Request, res: Response): Response {
    return res.status(200).send('Server is up and running!');
  }
}

export default new HealthController();
