const {
  randomNumberGenerator,
  throwErrorForEmptyValue
} = require("../helpers/util");

const dataGenerator = require("./dataGenerator");

const processData = (type, defaultData) => {
  return typeof dataGenerator[type] !== "undefined"
    ? dataGenerator[type](defaultData)
    : dataGenerator.default();
};

const processArrayData = arraySchema => {
  let data = [];
  const arrayLen = arraySchema.length;
  if (arrayLen === 1) {
    const arrayValue = arraySchema[0];
    const dataLen = randomNumberGenerator(30, 15);
    if (typeof arrayValue === "object") {
      for (let i = 0; i < dataLen; i++) {
        data.push(process(arrayValue, i + 1));
      }
    } else {
      for (let i = 0; i < dataLen; i++) {
        data.push(processData(arrayValue, i + 1));
      }
    }
  } else {
    data = arraySchema.random();
  }

  return data;
};

const processObjectData = objectSchema => {
  if (typeof objectSchema.__fixedValue !== "undefined") {
    return objectSchema.__fixedValue;
  } else if (typeof objectSchema.__valueList !== "undefined") {
    return objectSchema.__valueList.random();
  } else if (
    typeof objectSchema.__type !== "undefined" &&
    typeof dataGenerator[objectSchema.__type] !== "undefined" &&
    objectSchema.__type !== "token"
  ) {
    return processData(objectSchema.__type);
  } else if (
    typeof objectSchema.__type !== "undefined" &&
    objectSchema.__type === "array"
  ) {
    return processArrayData(objectSchema.__property);
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
  index
) => {
  const data = {};
  for (let key in schema) {
    if (Array.isArray(schema[`${key}`])) {
      data[key] = processArrayData(schema[`${key}`]);
    } else if (typeof schema[key] === "object") {
      data[key] = processObjectData(schema[`${key}`]);
    } else if (typeof schema[key] === "string") {
      data[key] = processData(schema[`${key}`], index);
    }
  }

  return data;
};

module.exports = { process };
