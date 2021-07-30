const config = require("./config.json");

const ignoreRoutes =  ["/favicon.ico", "/vendor/json-formatter/json-formatter.js.map"];

module.exports = {...config, ignoreRoutes };
