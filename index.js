const Koa = require("koa");
const koaBody = require("koa-body");
const cors = require("koa2-cors");
const render = require("koa-ejs");
const path = require("path");
const serve = require("koa-static");

const config = require("./config");
const router = require("./router");
const app = new Koa();

app.use(serve(path.join(__dirname, "public")));

render(app, {
  root: path.join(__dirname, "public"),
  layout: "layout",
  viewExt: "html"
});

app.use(koaBody());
app.use(cors({ origin: "*" }));

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.appPort, () => {
  console.log(`server running at ${config.appPort}`);
  console.log(`go to http://localhost:${config.appPort}/dashboard`);
});
