"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = exports.processObjectData = exports.generateObject = exports.processArrayData = exports.processUserData = exports.generateData = exports.processData = void 0;
const dataGenerator_1 = __importDefault(require("./dataGenerator"));
const storage_1 = require("./storage");
const processData = (type, params = {}, option) => {
    const typeDataList = type.split('>');
    if (typeDataList && typeDataList.length === 1) {
        return (0, exports.generateData)(typeDataList[0], params, option);
    }
    let result = '';
    for (const dataType of typeDataList) {
        result += `${(0, exports.generateData)(dataType, params, option)}`;
    }
    return result;
};
exports.processData = processData;
const generateData = (type, params = {}, option) => {
    const typeDataList = type.split(':');
    if (!typeDataList[0] || typeDataList[0].length === 0) {
        return dataGenerator_1.default.default();
    }
    return typeof dataGenerator_1.default[typeDataList[0]] !== 'undefined'
        ? dataGenerator_1.default[typeDataList[0]](typeDataList[1] || '', params, option)
        : (0, exports.processUserData)(type);
};
exports.generateData = generateData;
const processUserData = (input) => {
    const userOutput = input.split('|');
    if (userOutput.length > 1) {
        return (0, storage_1.randomArrayData)(userOutput);
    }
    else {
        return userOutput[0] || '';
    }
};
exports.processUserData = processUserData;
const processArrayData = (arraySchema = [], schema = {}, option) => {
    let data = [];
    if (arraySchema.length === 1) {
        const arrayValue = arraySchema[0];
        const { __range = "" } = schema;
        const { min, max = 10 } = (0, storage_1.getMinMax)(__range);
        const limit = min ? (0, storage_1.randomNumberGenerator)(max, min) : max;
        if (Array.isArray(arrayValue)) {
            for (let i = 0; i < limit; i++) {
                data.push((0, exports.processArrayData)(arrayValue, Object.assign({ __range: `${limit}`, __index: i + 1 }, schema), option));
            }
        }
        else if (typeof arrayValue === "object") {
            for (let i = 0; i < limit; i++) {
                data.push((0, exports.process)(arrayValue, Object.assign({ __range: `${limit}`, __index: i + 1 }, schema), option));
            }
        }
        else {
            for (let i = 0; i < limit; i++) {
                data.push((0, exports.processData)(arrayValue, Object.assign({ __range: `${limit}`, __index: i + 1 }, schema), option));
            }
        }
    }
    else if (arraySchema.length >= 2) {
        data = [(0, storage_1.randomArrayData)(arraySchema)];
    }
    return data;
};
exports.processArrayData = processArrayData;
const generateObject = (objectData = {}, option) => {
    return (0, exports.processData)(objectData.__type, objectData, option);
};
exports.generateObject = generateObject;
const processObjectData = (objectSchema = {}, params = {}, option = {}) => {
    if (typeof objectSchema.__type !== "undefined" &&
        objectSchema.__type !== "token" &&
        objectSchema.__type !== "array") {
        return (0, exports.generateObject)(objectSchema, option);
    }
    else if (typeof objectSchema.__type !== "undefined" &&
        objectSchema.__type === "array") {
        return (0, exports.processArrayData)([objectSchema.__property], objectSchema, option);
    }
    else if (typeof objectSchema.__type !== "undefined" &&
        objectSchema.__type === "token") {
        const data = (0, exports.process)(objectSchema.__property, {}, option);
        return (0, exports.processData)(objectSchema.__type, data, option);
    }
    else {
        return (0, exports.process)(objectSchema, {}, option);
    }
};
exports.processObjectData = processObjectData;
const process = (schema = {}, params = {}, option = {}) => {
    const data = {};
    for (let key in schema) {
        if (Array.isArray(schema[`${key}`])) {
            data[key] = (0, exports.processArrayData)(schema[`${key}`], params, option);
        }
        else if (typeof schema[key] === "object") {
            data[key] = (0, exports.processObjectData)(schema[`${key}`], params, option);
        }
        else if (typeof schema[key] === "string" && schema[key] !== "__auth") {
            data[key] = (0, exports.processData)(schema[`${key}`], params, option);
        }
    }
    return data;
};
exports.process = process;
