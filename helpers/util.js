const uuidv1 = require("uuid/v1");
const jwt = require("jsonwebtoken");
const Q = require("q");

const config = require("../config");

const throwErrorForEmptyValue = name => {
  throw `missing parameter value for ${name}`;
};

const uuid = () => {
  return uuidv1();
};

const tokenEncode = payload => {
  return jwt.sign(payload, config.tokenSecret, {
    expiresIn: Math.floor(Date.now() / 1000) + 60 * 60
  });
};

const tokenDecode = token => {
  if (!token) return Q.reject({ status: 404, msg: [] });

  return Q.ninvoke(jwt, "verify", token, config.tokenSecret)
    .then(payload => {
      return Q.resolve(payload);
    })
    .catch(e => {
      return Q.reject({
        status: 401,
        msg: "Invalid authentication token provided."
      });
    });
};

const randomNumberGenerator = (max = 0, min = 0) => {
  return max
    ? Math.round(Math.random() * (+max - +min)) + min
    : Math.round(Math.random());
};

const getMinMax = (__range = "") => {
  if (!__range || __range === "" || isNaN(__range)) {
    let [max, min = 1] = __range.split(",");
    return {
      max: max && max !== "" ? parseInt(max, 10) : 10,
      min: parseInt(min, 10)
    };
  } else {
    let max = parseInt(__range, 10);
    return { max };
  }
};

module.exports = {
  uuid,
  getMinMax,
  tokenEncode,
  tokenDecode,
  randomNumberGenerator,
  throwErrorForEmptyValue
};
