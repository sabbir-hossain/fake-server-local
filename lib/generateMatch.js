const { process } = require("./generator");
const {
  getMinMax,
  randomNumberGenerator,
  throwErrorForEmptyValue
} = require("../helpers/util");

const processArrayData = (body, key, arraySchema, params) => {
  let data = [];

  if (arraySchema.length === 1) {
    const arrayValue = arraySchema[0];
    const { __range = "" } = arrayValue;
    const { min, max = 10 } = getMinMax(__range);
    const limit = min ? randomNumberGenerator(max, min) : max;

    if (Array.isArray(arrayValue)) {
      for (let i = 0; i < limit; i++) {
        data.push(
          processArrayData(body, `${key}.${i}`, arrayValue, {
            __range: limit,
            __index: i + 1,
            ...params
          })
        );
      }
    } else if (typeof arrayValue === "object") {
      for (let i = 0; i < limit; i++) {
        data.push(
          processReqeust(body, `${key}.${i}`, arrayValue, {
            __range: limit,
            __index: i + 1,
            ...params
          })
        );
      }
    } else {
      for (let i = 0; i < limit; i++) {
        data.push(
          generateData(`${key}.${i}`, arrayValue, body[`${key}.${i}`] || null)
        );
      }
    }
  } else if (arraySchema.length >= 2) {
    data = [arraySchema.random()];
  }

  return data;
};

const generateData = (key, schema, input = null) => {
  if (!input) {
    const getData = process({ [`${key}`]: schema });
    return getData[`${key}`];
  } else {
    return input;
  }
};

const processReqeust = (
  body = {},
  oldKey = "",
  schema = throwErrorForEmptyValue("generator/process"),
  params = {}
) => {
  const data = {};
  for (let key in schema) {
    const newKey = oldKey !== "" ? `${oldKey}.${key}` : `${key}`;
    if (Array.isArray(schema[`${key}`])) {
      data[key] = processArrayData(body, newKey, schema[`${key}`], params);
    } else if (typeof schema[key] === "object") {
      data[key] = processReqeust(body, newKey, schema[`${key}`], params);
    } else if (typeof schema[key] === "string") {
      data[`${key}`] = generateData(
        newKey,
        schema[`${key}`],
        body[`${newKey}`] || null
      );
    }
  }

  return data;
};

module.exports = { processReqeust };
