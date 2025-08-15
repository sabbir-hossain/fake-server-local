const Router = require("koa-router");
const router = new Router();

const patchRequestController = require("./controller/mock-api/patch-request");
const deleteRequestController = require("./controller/mock-api/delete-request");
const postRequestController = require("./controller/mock-api/post-request");
const getRequestsController = require("./controller/mock-api/get-requests");
const views = require("./controller/front-end-views");

const projectController = require("./controller/projects");
const routeController = require("./controller/mock-api-routes-crud");

const { ignoreRoutes = [] } = require("./config");

router.get("/dashboard", views.index);
router.get("/helper", views.helper);

router.get(ignoreRoutes, async ctx => {
  ctx.body = {};
});

router.get("/heath", ctx => {
  ctx.body = "Server is up and running";
});

router.get("/", views.index);

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
router.patch("/*", patchRequestController);
router.delete("/*", deleteRequestController);

module.exports = router;
