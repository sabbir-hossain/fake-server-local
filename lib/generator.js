const {
  getMinMax,
  randomNumberGenerator,
  throwErrorForEmptyValue
} = require("../helpers/util");

const dataGenerator = require("./dataGenerator");

const processData = (type, params = {}) => {
  return typeof dataGenerator[type] !== "undefined"
    ? dataGenerator[type](params)
    : processUserData(type);
};

const checkNumber = (secondNumber, firstNumber) => {
  if (
    Number.isInteger(parseInt(secondNumber, 10)) &&
    Number.isInteger(parseInt(firstNumber, 10))
  ) {
    return true;
  } else {
    return false;
  }
};

const processUserData = input => {
  const userOutput = input.split(",");
  if (userOutput.length > 1) {
    return userOutput.random();
  } else {
    const rangeOutput = input.split("...");
    if (checkNumber(rangeOutput[1], rangeOutput[0])) {
      return generateRangeData(
        parseInt(rangeOutput[0], 10),
        parseInt(rangeOutput[1], 10)
      );
    } else {
      return rangeOutput[0];
    }
  }
};

const generateRangeData = (start, end) => {
  const rangeData = [];
  for (let i = start; i <= end; i++) {
    rangeData.push(i);
  }
  return rangeData.random();
};

const processArrayData = (arraySchema = [], schema = {}) => {
  let data = [];
  const { __range = "" } = schema;

  if (arraySchema.length === 1) {
    const arrayValue = arraySchema[0];
    const { min, max = 10 } = getMinMax(__range);
    const limit = min ? randomNumberGenerator(max, min) : max;

    if (Array.isArray(arrayValue)) {
      for (let i = 0; i < limit; i++) {
        data.push(
          processArrayData(arrayValue, {
            __range: limit,
            __index: i + 1,
            ...schema
          })
        );
      }
    } else if (typeof arrayValue === "object") {
      for (let i = 0; i < limit; i++) {
        data.push(
          process(arrayValue, {
            __range: limit,
            __index: i + 1,
            ...schema
          })
        );
      }
    } else {
      for (let i = 0; i < limit; i++) {
        data.push(
          processData(arrayValue, {
            __range: limit,
            __index: i + 1,
            ...schema
          })
        );
      }
    }
  } else if (arraySchema.length >= 2) {
    data = [arraySchema.random()];
  }

  return data;
};

const generateObject = (objectData = {}) => {
  return processData(objectData.__type, objectData);
};

const processObjectData = (objectSchema = {}, params = {}) => {
  if (
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
  params = {}
) => {
  const data = {};
  for (let key in schema) {
    if (Array.isArray(schema[`${key}`])) {
      data[key] = processArrayData(schema[`${key}`], params);
    } else if (typeof schema[key] === "object") {
      data[key] = processObjectData(schema[`${key}`], params);
    } else if (typeof schema[key] === "string") {
      data[key] = processData(schema[`${key}`], params);
    }
  }

  return data;
};

module.exports = { process };
