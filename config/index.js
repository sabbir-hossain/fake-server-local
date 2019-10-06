const config = require("./config.json");

const ignoreRoutes =  ["/favicon.ico"];

module.exports = {...config, ignoreRoutes };
