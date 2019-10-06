const Q = require("q");
const util = require("util");

const db = require("./connect");

const insert = util.promisify(db.insert);
const find = util.promisify(db.find);
const modify = util.promisify(db.update);
const deleteValue = util.promisify(db.remove);

const create = async data => {
  return await Q.ninvoke(db, "insert", data)
    .then(resp => {
      return resp;
    })
    .catch(err => {
      return err;
    });
};

const get = async (query = {}) => {
  return await Q.ninvoke(db, "find", query)
    .then(resp => {
      return resp;
    })
    .catch(err => {
      return err;
    });
};

const update = async (query, data) => {
  return await Q.ninvoke(db, "update", query, data)
    .then(resp => {
      return resp;
    })
    .catch(err => {
      return err;
    });
};

const remove = async query => {
  return await Q.ninvoke(db, "remove", query)
    .then(resp => {
      return resp;
    })
    .catch(err => {
      return err;
    });
};

module.exports = {
  create,
  get,
  update,
  remove
};
