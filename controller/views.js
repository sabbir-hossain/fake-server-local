"use strict";
const config = require("../config");

const index = async ctx => {
  return ctx.render("views/dashboard/index", {
    projectUrl: `http://localhost:${config.appPort}/`
  });
};

const helper = async ctx => {
  return ctx.render("views/helper/index", {});
};

module.exports = {
  index,
  helper
};
