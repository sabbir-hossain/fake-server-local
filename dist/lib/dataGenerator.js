"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomName = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const storage_1 = require("./storage");
const port = process.env.PORT || 3000;
const pdfGenerator = () => {
    return `http://localhost:${port}/assets/${(0, storage_1.randomArrayData)(storage_1.pdfFileList)}`;
};
const csvGenerator = () => {
    return `http://localhost:${port}/assets/${(0, storage_1.randomArrayData)(storage_1.csvFileList)}`;
};
const docGenerator = () => {
    return `http://localhost:${port}/assets/${(0, storage_1.randomArrayData)(storage_1.docFileList)}`;
};
const uuidGenerator = () => {
    return (0, uuid_1.v4)();
};
const booleanGenerator = () => {
    return !Math.round(Math.random());
};
const integerGenerator = (digit = '3') => {
    const [start, end = -1] = digit.split(",").map(num => num && num.trim() !== '' ? parseInt(num, 10) : -1);
    return end > -1
        ? (0, storage_1.randomNumberGenerator)(end, start)
        : (0, storage_1.randomNumberGenerator)(Math.pow(10, start) - 1, Math.pow(10, start - 1));
};
const floatGenerator = (digit = '3.2') => {
    const [intPart, decimalPart = '0'] = digit.split(".");
    return Number(`${integerGenerator(intPart)}.${integerGenerator(decimalPart)}`);
};
const zipCodeGenerator = () => {
    return `${integerGenerator('5')}`;
};
const domainNameGenerator = () => {
    return `https://${booleanGenerator() ? `www.` : ``}${wordGenerator()}.${(0, storage_1.randomArrayData)(storage_1.domainList)}`;
};
const emailNameGenerator = () => {
    return `${wordGenerator()}@${(0, storage_1.randomArrayData)(storage_1.emailDomainList)}`;
};
const dateGenerator = () => {
    const year = new Date().getFullYear();
    return `${(0, storage_1.randomNumberGenerator)(12, 1)}/${(0, storage_1.randomNumberGenerator)(28, 1)}/${(0, storage_1.randomNumberGenerator)(year, year - 25)}`;
};
const timeGenerator = () => {
    return `${(0, storage_1.randomNumberGenerator)(12, 1)}:${(0, storage_1.randomNumberGenerator)(59, 1)} ${(0, storage_1.randomNumberGenerator)() ? "AM" : "PM"}`;
};
const dateTimeGenerator = () => {
    return new Date(`${dateGenerator()} ${timeGenerator()}`).toISOString();
};
const secondGenerator = () => {
    return new Date(dateGenerator()).valueOf();
};
const getRandomName = (max = 9) => Array.from({ length: (0, storage_1.randomNumberGenerator)(max, 3) }, () => (0, storage_1.randomArrayData)(storage_1.smallCharList)).join("");
exports.getRandomName = getRandomName;
const wordGenerator = () => {
    return (0, exports.getRandomName)();
};
const titleGenerator = (__range = "") => {
    const { min, max = 5 } = (0, storage_1.getMinMax)(__range);
    const limit = min ? (0, storage_1.randomNumberGenerator)(max, min) : max;
    const result = [`${(0, storage_1.randomArrayData)(storage_1.capitalCharList)}${wordGenerator()}`];
    for (let i = 0; i < limit; i++) {
        result.push(wordGenerator());
    }
    return result.join(" ");
};
const textAreaGenerator = (__range = "") => {
    const { min, max = 50 } = (0, storage_1.getMinMax)(__range);
    const limit = min ? (0, storage_1.randomNumberGenerator)(max, min) : max;
    let result = '';
    for (let i = 0; i < limit; i++) {
        const text = `${booleanGenerator() && i % 7 === 0
            ? (0, storage_1.allowed_block_text)(titleGenerator())
            : titleGenerator()}`;
        result += `${text}${(0, storage_1.randomArrayData)(storage_1.allowed_end_of_line)}`;
    }
    return result;
};
const imageUrlGenerator = () => {
    return `http://localhost:${port}/assets/${(0, storage_1.randomArrayData)(storage_1.imageList)}`;
};
const tokenGenerator = (_other = '', payload, option) => {
    if (!payload || Object.keys(payload).length === 0) {
        throw new Error('Payload is required for token generation');
    }
    return jsonwebtoken_1.default.sign(payload, option.secret || 'super-secret', {
        expiresIn: Math.floor(Date.now() / 1000) + 60 * 60
    });
    ;
};
const ipAddressGenerator = () => {
    return `${(0, storage_1.randomNumberGenerator)(255)}.${(0, storage_1.randomNumberGenerator)(255)}.${(0, storage_1.randomNumberGenerator)(255)}.${(0, storage_1.randomNumberGenerator)(255)}`;
};
const alphanumericGenerator = ({ size = 25 }) => storage_1.alphanumericCharList.sort((a, b) => 0.5 - Math.random()).slice(0, size).join("");
exports.default = {
    default: wordGenerator,
    word: wordGenerator,
    title: titleGenerator,
    desc: textAreaGenerator,
    boolean: booleanGenerator,
    int: integerGenerator,
    float: floatGenerator,
    uuid: uuidGenerator,
    zipCode: zipCodeGenerator,
    domain: domainNameGenerator,
    email: emailNameGenerator,
    date: dateGenerator,
    time: timeGenerator,
    dateTime: dateTimeGenerator,
    second: secondGenerator,
    image: imageUrlGenerator,
    pdf: pdfGenerator,
    csv: csvGenerator,
    doc: docGenerator,
    token: tokenGenerator,
    ip: ipAddressGenerator,
    alphanumeric: alphanumericGenerator
};
