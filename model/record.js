const db = require("../database/db");
const { throwErrorForEmptyValue } = require("../helpers/util");

const collection = "record";

const save = async data => {
  // const _id = uuid();
  const { projectName, routeName, routeType } = data;
  const _id = `${routeType}/${projectName}${routeName}`;
  const result = await db.create({ collection, _id, ...data });
  return result;
};

const update = async (
  id = throwErrorForEmptyValue("record/update/id"),
  data
) => {
  const { schema, options } = data;
  return await db.update(
    { _id: id },
    {
      $set: { schema, options }
    }
  );
};

const getById = async (id = throwErrorForEmptyValue("record/id")) => {
  const result = await db.get({ _id: id });

  return result[0] || {};
};

const routeList = async (
  projectId = throwErrorForEmptyValue("record/list")
) => {
  return await db.get({ collection, projectId });
};

const remove = async (id = throwErrorForEmptyValue("recored/remove")) => {
  return await db.remove({ _id: id });
};

module.exports = {
  save,
  getById,
  routeList,
  remove,
  update
};
