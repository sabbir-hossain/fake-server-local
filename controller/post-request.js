const RecordModel = require("../model/record");
const { processReqeust } = require("../lib/generateMatch");

const routeType = "POST";

module.exports = async ctx => {
  try {

    const urlModel = ctx.request.url.split("?")[0];
    const _id = `${routeType}${urlModel}`;
    const result = await RecordModel.getById(_id);
  
    const { schema } = result;
    const body = ctx.request.body;

    validateAuth(schema, ctx);
  
    const data = processReqeust(body, "", schema);
  
    ctx.body = data;
  }
  catch(error) {
    ctx.body = err;
  }


};
