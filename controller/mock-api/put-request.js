const RecordModel = require("../../model/record");
const { validateAuth } = require("../../helpers/util");
const { processReqeust } = require("../../lib/generateMatch");

const routeType = "PUT";

module.exports = async ctx => {
  try {
    const urlModel = ctx.request.url.split("?")[0];
    const _id = `${routeType}${urlModel}`;
    const result = await RecordModel.getById(_id);
  
    const { schema, options={} } = result;
    
    if(!schema) {
      ctx.throw(404);
    }

    validateAuth(options, ctx);
    
    const body = ctx.request.body;
    const data = processReqeust(body, "", schema);
  
    ctx.body = data;
  }
  catch(error) {
    ctx.throw(error);
  }
};
