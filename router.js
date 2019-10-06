const Router = require("koa-router");
const router = new Router();

const postRequestController = require("./controller/post-request");
const getRequestsController = require("./controller/get-requests");
const views = require("./controller/views");

const projectController = require("./controller/projects");
const routeController = require("./controller/routes");

const { ignoreRoutes = [] } = require("./config");

router.get("/dashboard", views.index);
router.get("/helper", views.helper);

router.get(ignoreRoutes, async ctx => {
  ctx.body = {};
});

router.get("/heath", ctx => {
  ctx.body = "Server is up and running";
});

// router.get("/*", getRequests.get);

router.post("/__project/create", projectController.save);
router.get("/__project/list", projectController.list);
router.put("/__project/switch", projectController.switchProject);
// router.patch("/__project/:id/update", projectController.update);

router.post("/__route/save", routeController.save);
router.put("/__route/update", routeController.update);
router.get("/__route/:projectId/list", routeController.list);
router.get("/__route/get", routeController.getById);
router.put("/__route/delete", routeController.remove);

router.post("/*", postRequestController);
router.get("/*", getRequestsController);

module.exports = router;
