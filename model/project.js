const db = require("../database/db");
const { throwErrorForEmptyValue } = require("../helpers/util");
const collection = "projects";

const create = async (data = {}) => {
  const {
    isActive = false,
    name = throwErrorForEmptyValue("create project")
  } = data;
  const result = await db.create({ collection, isActive, name });
  return result;
};

const updateById = async (
  id = throwErrorForEmptyValue("model/project/update"),
  data = {}
) => {
  return await db.update({ _id: id }, data);
};

const list = async (query = {}) => {
  return await db.get({ ...{ collection }, ...query });
};

module.exports = {
  list,
  create,
  updateById
};
