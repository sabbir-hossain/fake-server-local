import { Controller, Get } from 'routing-controllers';
/**
 * HealthController handles health check requests.
 */
@Controller("/health-check")
export class HealthController {
  /**
   * Checks the health of the server.
   * @returns A message indicating the server is up and running.
   */
  @Get('/')
  public checkHealth() {
    return "Server is up and running.";
  }
}
