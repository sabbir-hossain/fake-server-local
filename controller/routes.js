const RecordModel = require("../model/record");
const { throwErrorForEmptyValue } = require("../helpers/util");

const save = async ctx => {
  const {
    projectId,
    projectName = throwErrorForEmptyValue("routes/save"),
    schema,
    routeName = throwErrorForEmptyValue("routes/routeName"),
    routeType = throwErrorForEmptyValue("routes/routeType")
  } = ctx.request.body;

  const response = await RecordModel.save({
    projectId,
    projectName,
    schema,
    routeName,
    routeType
  });

  ctx.body = response;
};

const update = async ctx => {
  const {
    id = throwErrorForEmptyValue("routes/update/id"),
    projectId,
    projectName,
    schema,
    routeName,
    routeType
  } = ctx.request.body;

  const response = await RecordModel.update(id, {
    projectId,
    projectName,
    schema,
    routeName,
    routeType
  });
  ctx.body = response;
};

const list = async ctx => {
  const { projectId } = ctx.params;
  ctx.body = await RecordModel.routeList(projectId);
};

const getById = async ctx => {
  const { id } = ctx.query;
  ctx.body = await RecordModel.getById(id);
};

const remove = async ctx => {
  const { id = throwErrorForEmptyValue("routes/remove/id") } = ctx.request.body;
  const result = await RecordModel.remove(id);
  ctx.body = result;
};

module.exports = {
  save,
  list,
  remove,
  update,
  getById
};
