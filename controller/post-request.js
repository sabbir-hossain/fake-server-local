const RecordModel = require("../model/record");
const { validateAuth } = require("../helpers/util");
const { processReqeust } = require("../lib/generateMatch");

const routeType = "POST";

module.exports = async ctx => {
  try {
    console.log(" POST: ", { url : ctx.request.url });
    const urlModel = ctx.request.url.split("?")[0];
    const _id = `${routeType}${urlModel}`;
    const result = await RecordModel.getById(_id);
  
    const { schema } = result;
    if(!schema) {
      ctx.throw(404);
    }
    
    const body = ctx.request.body;
    validateAuth(schema, ctx);
  
    const data = processReqeust(body, "", schema);

    ctx.body = data;
  }
  catch(error) {
    console.error(error);
    ctx.body = error;
  }
};
