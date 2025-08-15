const RecordModel = require("../../model/record");
// const { process } = require("../lib/generator");
const Generator = require("../../lib/generator");
const { validateAuth } = require("../../helpers/util");

const routeType = "GET";

module.exports = async ctx => {
  try {
    const urlModel = ctx.request.url.split("?")[0];
    const _id = `${routeType}_${urlModel.replaceAll('/', '_')}`;
    const result = await RecordModel.getById(_id);
    const { schema, options={} } = result;

    if(!schema) {
      ctx.throw(404);
    }

    validateAuth(options, ctx);

    const inputSchema = { __data: schema };
    const data = Generator.process(inputSchema);

    ctx.body = data.__data || data;
  } catch (err) {
    console.error(err);
    ctx.throw(err);
  }
};
