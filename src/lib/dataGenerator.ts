import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import { allowed_block_text, allowed_end_of_line, alphanumericCharList, capitalCharList, csvFileList, docFileList, domainList, emailDomainList, getMinMax, imageList, pdfFileList, randomArrayData, randomNumberGenerator, smallCharList } from "./storage";
import { Options, Params } from "../types/type";
const port = process.env.PORT || 3000

const pdfGenerator = () => {
  return `http://localhost:${port}/assets/${randomArrayData(pdfFileList)}`;
};

const csvGenerator = () => {
  return `http://localhost:${port}/assets/${randomArrayData(csvFileList)}`;
};

const docGenerator = () => {
  return `http://localhost:${port}/assets/${randomArrayData(docFileList)}`;
};

const uuidGenerator = () => {
  return uuid();
};

const booleanGenerator = () => {
  return !Math.round(Math.random());
};

const integerGenerator = (digit='3'):  number => {
  const [start=1, end = -1] = digit.split(",").map(num => num && num.trim() !== '' ? parseInt(num, 10) : -1);
  return end > -1 
    ? randomNumberGenerator(end, start) 
    : randomNumberGenerator(Math.pow(10, start) - 1, Math.pow(10, start - 1));
};

const floatGenerator = (digit='3.2'):  number => {
  const [intPart, decimalPart = '0'] = digit.split(".");
  return Number(`${integerGenerator(intPart)}.${integerGenerator(decimalPart)}`);
};

const zipCodeGenerator = () => {
  return `${integerGenerator('5')}`;
};

const domainNameGenerator = () => {
  return `https://${
    booleanGenerator() ? `www.` : ``
  }${wordGenerator()}.${randomArrayData(domainList)}`;
};

const emailNameGenerator = () => {
  return `${wordGenerator()}@${randomArrayData(emailDomainList)}`;
};

const dateGenerator = () => {
  const year = new Date().getFullYear();
  return `${randomNumberGenerator(12, 1)}/${randomNumberGenerator(
    28,
    1
  )}/${randomNumberGenerator(year, year - 25)}`;
};

const timeGenerator = () => {
  return `${randomNumberGenerator(12, 1)}:${randomNumberGenerator(59, 1)} ${
    randomNumberGenerator() ? "AM" : "PM"
  }`;
};

const dateTimeGenerator = () => {
  return new Date(`${dateGenerator()} ${timeGenerator()}`).toISOString();
};

const secondGenerator = () => {
  return new Date(dateGenerator()).valueOf()
}

export const getRandomName = (max=9): string => 
  Array.from({ length: randomNumberGenerator(max, 3) }, () => randomArrayData(smallCharList)).join("")

const wordGenerator = () => {
  return getRandomName();
};

const titleGenerator = (__range = ""): string => {
  const { min, max = 5 } = getMinMax(__range);
  const limit = min ? randomNumberGenerator(max, min) : max;

  const result = [`${randomArrayData(capitalCharList)}${wordGenerator()}`];
  for (let i = 0; i < limit; i++) {
    result.push(wordGenerator());
  }
  return result.join(" ");
};

const textAreaGenerator = (__range = ""): string => {
  const { min, max = 50 } = getMinMax(__range);
  const limit = min ? randomNumberGenerator(max, min) : max;
  let result = '';
  for (let i = 0; i < limit; i++) {
    const text = `${
      booleanGenerator() && i % 7 === 0 
        ? allowed_block_text(titleGenerator())
        : titleGenerator()
    }`;
    result += `${text}${randomArrayData(allowed_end_of_line)}`;  
  }
  return result;
};

const imageUrlGenerator = () => {
  return `http://localhost:${port}/assets/${randomArrayData(imageList)}`;
};


const tokenGenerator = (_other='', payload: Params, option: Options) => {
  if(!payload || Object.keys(payload).length === 0) {
    throw new Error('Payload is required for token generation');
  }

  return jwt.sign(payload, option.secret || 'super-secret', {
    expiresIn: Math.floor(Date.now() / 1000) + 60 * 60
  });;
};

const ipAddressGenerator = () => {
  return `${randomNumberGenerator(255)}.${randomNumberGenerator(
    255
  )}.${randomNumberGenerator(255)}.${randomNumberGenerator(255)}`;
};

const alphanumericGenerator = ({ size = 25 }) => alphanumericCharList.sort((a, b) => 0.5 - Math.random()).slice(0, size).join("")


export default {
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
}
