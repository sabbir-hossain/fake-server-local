const RecordModel = require("../model/record");
const { processReqeust } = require("../lib/generateMatch");

const routeType = "PATCH";

module.exports = async ctx => {
  try {
    const urlModel = ctx.request.url.split("?")[0];
    const _id = `${routeType}${urlModel}`;
    const result = await RecordModel.getById(_id);
  
    const { schema } = result;
    
    validateAuth(schema, ctx);

    const body = ctx.request.body;
    const data = processReqeust(body, "", schema);
  
    ctx.body = data;
  }
  catch(error) {
    ctx.body = err;
  }

};
