import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { allowed_block_text, allowed_end_of_line, alphanumericCharList, capitalCharList, csvFileList, docFileList, domainList, emailDomainList, getMinMax, imageList, pdfFileList, randomArrayData, randomNumberGenerator, smallCharList } from "./storage";
import { Options, Params } from "../types/type";

dotenv.config();

const port = process.env.PORT || 9920;

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
  const input = `${digit}`.trim();
  // fall back to 3 digits when no/invalid input is given
  const parts = (input === '' ? '3' : input).split(',');
  const start = parts[0] && !isNaN(parseInt(parts[0], 10)) ? parseInt(parts[0], 10) : 3;
  const end = parts[1] && !isNaN(parseInt(parts[1], 10)) ? parseInt(parts[1], 10) : -1;
  return end > -1
    ? randomNumberGenerator(end, start)
    : randomNumberGenerator(Math.pow(10, start) - 1, Math.pow(10, start - 1));
};

const floatGenerator = (digit='3.2'):  number => {
  const input = `${digit}`.trim();
  // fall back to 3.2 when no/invalid input is given
  const parts = (input === '' ? '3.2' : input).split('.');
  const intPart = parts[0] && !isNaN(parseInt(parts[0], 10)) ? parts[0] : '3';
  const decimalPart = parts[1] && !isNaN(parseInt(parts[1], 10)) ? parts[1] : '2';
  const result = Number(`${integerGenerator(intPart)}.${integerGenerator(decimalPart)}`);
  return Number.isNaN(result) ? 0.0 : result;
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

const parseDayOffset = (input: string): number => {
  const parsed = parseInt(`${input}`.trim(), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const shiftDateByDays = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const formatDate = (date: Date, format: string): string => {
  const day = `${date.getDate()}`.padStart(2, "0");
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const year = `${date.getFullYear()}`;
  const shortYear = year.slice(-2);
  return format
    .replace("YYYY", year)
    .replace("YY", shortYear)
    .replace("DD", day)
    .replace("MM", month);
};

/**
 * Accepts an input string, split on "|":
 * - "format|offset" (e.g. "DD/MM/YYYY|5", "YYYY-MM-DD|-2")
 * - "offset" only (e.g. "5") -> default format DD/MM/YYYY with the offset
 * Offset logic matches dateTimeGenerator:
 * 0 (or empty) = today, positive = future, negative = past (in days).
 */
const dateGenerator = (input = "") => {
  const parts = `${input}`.split("|");
  const first = (parts[0] || "").trim();
  const second = (parts[1] || "").trim();

  let format = "DD/MM/YYYY";
  let offset = 0;

  const firstIsNumber = first !== "" && !Number.isNaN(parseInt(first, 10));
  if (firstIsNumber) {
    // only a number was given: default format + offset logic
    offset = parseInt(first, 10);
  } else {
    if (first !== "") {
      format = first;
    }
    if (second !== "" && !Number.isNaN(parseInt(second, 10))) {
      offset = parseInt(second, 10);
    }
  }

  return formatDate(shiftDateByDays(offset), format);
};

const timeGenerator = () => {
  return `${randomNumberGenerator(12, 1)}:${randomNumberGenerator(59, 1)} ${
    randomNumberGenerator() ? "AM" : "PM"
  }`;
};

/**
 * Accepts an input string: a positive number (future date), a negative
 * number (past date) or zero (today). The time is always random.
 */
const dateTimeGenerator = (input = "") => {
  const offset = parseDayOffset(input);
  const date = shiftDateByDays(offset);
  date.setHours(
    randomNumberGenerator(23, 0),
    randomNumberGenerator(59, 0),
    randomNumberGenerator(59, 0)
  );
  return date.toISOString();
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

const phoneGenerator = () => {
  return `${integerGenerator('3')}-${integerGenerator('3')}-${integerGenerator('4')}`;
};

const alphanumericGenerator = ({ size = 25 }) => alphanumericCharList.sort((a, b) => 0.5 - Math.random()).slice(0, size).join("")


export default {
  default: wordGenerator,
  word: wordGenerator,
  id: uuidGenerator,
  desc: textAreaGenerator,
  boolean: booleanGenerator,
  int: integerGenerator,
  integer: integerGenerator,
  float: floatGenerator,
  uuid: uuidGenerator,
  phone: phoneGenerator,
  zipCode: zipCodeGenerator,
  zipcode: zipCodeGenerator,
  domain: domainNameGenerator,
  url: domainNameGenerator,
  email: emailNameGenerator,
  date: dateGenerator,
  time: timeGenerator,
  dateTime: dateTimeGenerator,
  'date-time': dateTimeGenerator,
  second: secondGenerator,
  image: imageUrlGenerator,
  pdf: pdfGenerator,
  csv: csvGenerator,
  doc: docGenerator,
  token: tokenGenerator,
  ip: ipAddressGenerator,
  ipaddress: ipAddressGenerator,
  alphanumeric: alphanumericGenerator
}
