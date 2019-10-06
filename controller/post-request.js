const RecordModel = require("../model/record");
const { process } = require("../lib/generator");

const routeType = "POST";

module.exports = async ctx => {
  const urlModel = ctx.request.url.split("?")[0];
  const _id = `${routeType}${urlModel}`;
  const result = await RecordModel.getById(_id);

  const { schema } = result;
  const data = process(schema);

  const body = ctx.request.body;

  ctx.body = data;
};
