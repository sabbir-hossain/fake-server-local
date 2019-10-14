const RecordModel = require("../model/record");
const { processReqeust } = require("../lib/generateMatch");

const routeType = "POST";

module.exports = async ctx => {
  const urlModel = ctx.request.url.split("?")[0];
  const _id = `${routeType}${urlModel}`;
  const result = await RecordModel.getById(_id);

  const { schema } = result;
  const body = ctx.request.body;

  const data = processReqeust(body, schema);

  ctx.body = data;
};
