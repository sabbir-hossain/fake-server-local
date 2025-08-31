import { Router } from 'express';
import HealthController from './controllers/healthController';
import ProjectController from './controllers/dataController';
import RecordController from './controllers/projectController';

const router = Router();

router.get('/health-check', HealthController.checkHealth);

router.post('/__project/create', RecordController.createProject.bind(RecordController));
router.get('/__project/list', RecordController.getInitialData.bind(RecordController));
router.get('/__project/:projectId/route/:routeId', RecordController.getRouteData.bind(RecordController));
router.get('/__route/:projectId/list', RecordController.getRouteList.bind(RecordController));
router.post('/__route/save', RecordController.saveRoute.bind(RecordController));
router.put('/__project/:projectId/route/:routeId/update', RecordController.updateRoute.bind(RecordController));
router.delete('/__project/:projectId/route/:routeId/delete', RecordController.removeRoute.bind(RecordController));
router.put('/__project/:projectId/switch', RecordController.getProjectData.bind(RecordController));

// router.all('/:project/*', ProjectController.handleProjectRequest.bind(ProjectController));

export default router;