import { ObjectSchemaOption, Options, Params, Schema } from "../types/type";
import dataGenerator from "./dataGenerator";
import { getMinMax, randomArrayData, randomNumberGenerator } from "./storage";

export const processData = (type: string, params: Params = {}, option: Options): string | number[] => {
  const typeDataList = type.split('>');

  if(typeDataList && typeDataList.length === 1) {
    return generateData(typeDataList[0], params, option);
  }

  let result = '';
  for(const dataType of typeDataList) {
    result += `${generateData(dataType, params, option)}'`;
  }

  return result;
};


export const generateData = (type: string, params: Params = {}, option: Options): string | number[] => {
  const typeDataList = type.split(':'); 
  if(!typeDataList [0] || typeDataList[0].length === 0) {
    return dataGenerator.default();
  }
  
  return typeof (dataGenerator as any)[typeDataList[0]] !== 'undefined'
    ? (dataGenerator as any)[typeDataList[0]](typeDataList [1] || '', params, option)
    : processUserData(type);
};

export const processUserData = (input: string): string | number[] => {
  const userOutput = input.split('|');
  if (userOutput.length > 1) {
    return processUserData(randomArrayData(userOutput) as string);
  } else {
    return userOutput[0] || '';
  }
};

export const processArrayData = (arraySchema: Params[] = [], schema: ObjectSchemaOption = {}, option: Options): any => {
  let data = [];
  if (arraySchema.length === 1) {
    const arrayValue = arraySchema[0];
    const { __range = "" } = schema;
    const { min, max = 10 } = getMinMax(__range);
    const limit = min ? randomNumberGenerator(max, min) : max;

    if (Array.isArray(arrayValue)) {
      for (let i = 0; i < limit; i++) {
        data.push(
          processArrayData(arrayValue, {
            __range: `${limit}`,
            __index: i + 1,
            ...schema
          }, option)
        );
      }
    } else if (typeof arrayValue === "object") {
      for (let i = 0; i < limit; i++) {
        data.push(
          process(arrayValue, {
            __range: `${limit}`,
            __index: i + 1,
            ...schema
          }, option)
        );
      }
    } else {
      for (let i = 0; i < limit; i++) {
        data.push(
          processData(arrayValue, {
            __range: `${limit}`,
            __index: i + 1,
            ...schema
          }, option)
        );
      }
    }
  } else if (arraySchema.length >= 2) {
    data = [randomArrayData(arraySchema)];
  }

  return data;
};

export const generateObject = (objectData: ObjectSchemaOption = {}, option: Options) => {
  return processData(objectData.__type as string, objectData, option);
};

export const processObjectData = (objectSchema: ObjectSchemaOption = {}, params: Params = {}, option: Options = {}) => {
  if (
    typeof objectSchema.__type !== "undefined" &&
    objectSchema.__type !== "token" &&
    objectSchema.__type !== "array"
  ) {
    return generateObject(objectSchema, option);
  } else if (
    typeof objectSchema.__type !== "undefined" &&
    objectSchema.__type === "array"
  ) {
    return processArrayData([objectSchema.__property] as Params[], objectSchema, option);
  } else if (
    typeof objectSchema.__type !== "undefined" &&
    objectSchema.__type === "token"
  ) {
    const data = process(objectSchema.__property as ObjectSchemaOption, {}, option );
    return processData(objectSchema.__type, data, option);
  } else {
    return process(objectSchema, {}, option);
  }
};

export const process = (
  schema: ObjectSchemaOption = {},
  params: Params = {},
  option: Options = {}
) => {
  const data: Params = {};
  for (let key in schema) {
    if (Array.isArray(schema[`${key}`])) {
      data[key] = processArrayData(schema[`${key}`], params, option);
    } else if (typeof schema[key] === "object") {
      data[key] = processObjectData(schema[`${key}`], params, option);
    } else if (typeof schema[key] === "string"  && schema[key] !== "__auth") {
      data[key] = processData(schema[`${key}`], params, option);
    }
  }

  return data;
};

