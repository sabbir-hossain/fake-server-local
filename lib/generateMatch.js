const { process } = require("./generator");

const processArrayData = (body, schema, params) => {};

const processObjectData = (body, schema, params) => {};

const processReqeust = (
  body,
  schema = throwErrorForEmptyValue("generator/process")
) => {
  const data = {};
  for (let key in schema) {
    if (Array.isArray(schema[`${key}`])) {
      data[key] = processArrayData(schema[`${key}`], params);
    } else if (typeof schema[key] === "object") {
      data[key] = processObjectData(schema[`${key}`], params);
    } else if (typeof schema[key] === "string") {
      const getData = process({ [`${key}`]: schema[key] });
      data[`${key}`] = getData[`${key}`];
    }
  }

  return data;
};

/*
  const data = {};
  for (let key in schema) {
    console.log({ key, bodyKey: body[key], schemaKey: schema[key] });
    // data[key] =
    //   typeof body[key] === "undefined" ? process(schema[key]) : body[key];
    if (typeof body[key] === "undefined") {
      const getData = process({ [`${key}`]: schema[key] });
      console.log({ getData });
      data[`${key}`] = getData[`${key}`];
    } else {
      body[key] = body[key];
    }
  }

  console.log(JSON.stringify(data, null, 3));
  return data;
*/

module.exports = { processReqeust };
