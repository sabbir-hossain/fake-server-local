const RecordModel = require("../model/record");
// const { process } = require("../lib/generator");
const Generator = require("../lib/generator");
const { validateAuth } = require("../helpers/util");

const routeType = "GET";

module.exports = async ctx => {
  try {
    const urlModel = ctx.request.url.split("?")[0];

    console.log(" GET: ", { url : ctx.request.url });
   
    const _id = `${routeType}${urlModel}`;
    const result = await RecordModel.getById(_id);
    const { schema } = result;

    if(!schema) {
      ctx.throw(404);
    }

    validateAuth(schema, ctx);

    const data = Generator.process(schema);

    ctx.body = data;
  } catch (err) {
    ctx.body = err;
  }
};
