const { process } = require("./generator");

const processArrayData = (body, schema, params) => {
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

const generateData = (key, schema, input) => {
  if (!input) {
    const getData = process({ [`${key}`]: schema });
    return getData[`${key}`];
  } else {
    return input;
  }
};

const processReqeust = (
  body,
  schema = throwErrorForEmptyValue("generator/process"),
  params = {}
) => {
  const data = {};
  for (let key in schema) {
    if (Array.isArray(schema[`${key}`])) {
      data[key] = processArrayData(schema[`${key}`], params);
    } else if (typeof schema[key] === "object") {
      data[key] = processReqeust(body, schema[`${key}`], params);
    } else if (typeof schema[key] === "string") {
      data[`${key}`] = generateData(key, schema[`${key}`], body[`${key}`]);
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
