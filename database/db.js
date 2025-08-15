const Q = require("q");
const util = require("util");

const db = require("./connect");

const insert = util.promisify(db.insert);
const find = util.promisify(db.find);
const modify = util.promisify(db.update);
const deleteValue = util.promisify(db.remove);

const create = data => {
  return Q.ninvoke(db, "insert", data)
    .then(resp => {
      return resp;
    })
    .catch(err => {
      return err;
    });
};

const get = (query = {}) => {
  return Q.ninvoke(db, "find", query)
    .then(resp => {
      return resp;
    })
    .catch(err => {
      return err;
    });
};

const update = (query, data) => {
  return Q.ninvoke(db, "update", query, data)
    .then(resp => {
      return resp;
    })
    .catch(err => {
      return err;
    });
};

const remove = query => {
  return Q.ninvoke(db, "remove", query)
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
