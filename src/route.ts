import { Router } from 'express';
import HealthController from './controllers/healthController';
import ProjectController from './controllers/projectController';
import RecordController from './controllers/recordController';

const router = Router();

router.get('/health-check', HealthController.checkHealth);

router.post('/__project/create', RecordController.createProject);
router.get('/__project/list', RecordController.getInitialData);
router.get('/__project/:projectId/route/:routeId', RecordController.getRouteData);
router.get('/__route/:projectId/list', RecordController.getRouteList);
router.post('/__route/save', RecordController.saveRoute);
router.put('/__project/:projectId/route/:routeId/update', RecordController.updateRoute);
router.delete('/__project/:projectId/route/:routeId/delete', RecordController.removeRoute);
router.put('/__project/:projectId/switch', RecordController.getProjectData);

router.all('/:project/*', ProjectController.handleProjectRequest);

export default router;