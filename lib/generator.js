const {
  randomNumberGenerator,
  throwErrorForEmptyValue
} = require("../helpers/util");

const dataGenerator = require("./dataGenerator");

const processData = (type, params) => {
  return typeof dataGenerator[type] !== "undefined"
    ? dataGenerator[type](params)
    : type;
};

const processArrayData = (arraySchema = [], schema = {}) => {
  let data = [];

  const { __limit = null, __max = 30, __min = 10 } = schema;
  console.log({
    arraySchema,
    schemaLen: arraySchema.length,
    __limit,
    __max,
    __min
  });
  if (arraySchema.length === 1) {
    const arrayValue = arraySchema[0];
    const limit = __limit || randomNumberGenerator(__max, __min);

    if (typeof arrayValue === "object") {
      for (let i = 0; i < limit; i++) {
        data.push(
          process(arrayValue, {
            __totalCount: limit,
            __index: i + 1,
            ...schema
          })
        );
      }
    } else {
      const rangeOutput = arrayValue.split("...");
      const rangeData = [];
      if (
        Number.isInteger(parseInt(rangeOutput[1], 10)) &&
        Number.isInteger(parseInt(rangeOutput[0], 10))
      ) {
        const start = parseInt(rangeOutput[0], 10);
        const end = parseInt(rangeOutput[1], 10);
        for (let i = start; i <= end; i++) {
          rangeData.push(i);
        }
        data = rangeData.random();
      } else {
        for (let i = 0; i < limit; i++) {
          data.push(
            processData(arrayValue, {
              __totalCount: limit,
              __index: i + 1,
              ...schema
            })
          );
        }
      }
    }
    return data;
  } else if (arraySchema.length >= 2) {
    // console.log({ arraySchema });
    data = arraySchema.random();
  }

  return data;
};

const generateObject = (objectData = {}) => {
  const { __max, __min, __type } = objectData;

  return processData(__type, { __max, __min });
};

const processObjectData = objectSchema => {
  if (typeof objectSchema.__fixedValue !== "undefined") {
    return objectSchema.__fixedValue;
  } else if (typeof objectSchema.__valueList !== "undefined") {
    return objectSchema.__valueList.random();
  } else if (
    typeof objectSchema.__type !== "undefined" &&
    objectSchema.__type !== "token" &&
    objectSchema.__type !== "array"
  ) {
    return generateObject(objectSchema);
  } else if (
    typeof objectSchema.__type !== "undefined" &&
    objectSchema.__type === "array"
  ) {
    return processArrayData([objectSchema.__property], objectSchema);
  } else if (
    typeof objectSchema.__type !== "undefined" &&
    objectSchema.__type === "token"
  ) {
    const data = process(objectSchema.__property);
    return processData(objectSchema.__type, data);
  } else {
    return process(objectSchema);
  }
};

const process = (
  schema = throwErrorForEmptyValue("generator/process"),
  params
) => {
  const data = {};
  for (let key in schema) {
    console.log({ key, data: schema[`${key}`] });
    if (Array.isArray(schema[`${key}`])) {
      data[key] = processArrayData(schema[`${key}`]);
    } else if (typeof schema[key] === "object") {
      data[key] = processObjectData(schema[`${key}`]);
    } else if (typeof schema[key] === "string") {
      data[key] = processData(schema[`${key}`], params);
    }
  }

  return data;
};

module.exports = { process };
