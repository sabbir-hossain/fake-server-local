const uuidv1 = require("uuid/v1");
const jwt = require("jsonwebtoken");
const Q = require("q");

const config = require("../config");

const throwErrorForEmptyValue = name => {
  throw `missing parameter value for ${name}`;
  // throw new Error(`missing parameter value for ${name}`);
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

function checkObject(obj1, obj2) {
  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  let isEqual = false;
  for (let i = 0, len = obj1Keys.length; i < len; i++) {
    const key1 = obj1Keys[i] || "";
    const key2 = obj2Keys[obj2Keys.indexOf(key1) || 0] || "";
    if (key2 === "" || key1 === "") {
      return false;
    } else if (
      typeof obj2[key2] === "undefined" ||
      typeof obj1[key1] === "undefined"
    ) {
      return false;
    } else if (typeof obj1[key1] === "object") {
      isEqual = checkObject(obj1[key1], obj2[key2]);
      if (!isEqual) {
        return false;
      }
    } else if (typeof obj1[key1] === "function") {
      if (obj1[key1].toString() !== obj2[key2].toString()) {
        return false;
      } else {
        isEqual = true;
      }
    } else if (obj1[key1] === obj2[key2]) {
      isEqual = true;
    } else {
      return false;
    }
  }

  if (isEqual) {
    return true;
  } else {
    return false;
  }
}

const validateAuth = (options=null, ctx) => {
  
  if(!options || typeof options["__auth"] === "undefined" || !options["__auth"]) {
    return true;
  }

  if( typeof ctx.request.header["authorization"] !== "undefined" && ctx.request.header["authorization"] !== "") {
    return true;
  } else if(typeof ctx.request.header["x-access-token"] !== "undefined" && ctx.request.header["x-access-token"] !== "") {
    return true;
  } else if(typeof ctx.request.header["x-auth-token"] !== "undefined" && ctx.request.header["x-auth-token"] !== "") {
    return true;
  } else {
    ctx.throw(400, "Un-authorize");
  }
}

module.exports = {
  uuid,
  getMinMax,
  tokenEncode,
  tokenDecode,
  checkObject,
  randomNumberGenerator,
  throwErrorForEmptyValue,
  validateAuth
};
