const RecordModel = require("../../model/record");
// const { process } = require("../lib/generator");
const Generator = require("../../lib/generator");
const { validateAuth } = require("../../helpers/util");

const routeType = "GET";

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

    const data = Generator.process(schema);

    ctx.body = data;
  } catch (err) {
    ctx.throw(error);
  }
};
