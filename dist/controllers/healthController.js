"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * HealthController handles health check requests.
 */
class HealthController {
    /**
     * Checks the health of the server.
     * @returns A message indicating the server is up and running.
     */
    checkHealth(req, res) {
        return res.status(200).send('Server is up and running!');
    }
}
exports.default = new HealthController();
