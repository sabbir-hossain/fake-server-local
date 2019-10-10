const {
  wordList,
  imageList,
  domainList,
  docFileList,
  csvFileList,
  pdfFileList,
  phoneAreaList,
  emailDomainList
} = require("./storage");

const {
  uuid,
  getMinMax,
  tokenEncode,
  randomNumberGenerator,
  throwErrorForEmptyValue
} = require("../helpers/util");

const config = require("../config");

Array.prototype.random = function() {
  return this[Math.round(Math.random() * (this.length - 1))];
};

const pdfGenerator = () => {
  return `http://localhost:${config.appPort}/assets/${pdfFileList.random()}`;
};

const csvGenerator = () => {
  return `http://localhost:${config.appPort}/assets/${csvFileList.random()}`;
};

const docGenerator = () => {
  return `http://localhost:${config.appPort}/assets/${docFileList.random()}`;
};

const uuidGenerator = () => {
  return uuid();
};

const idGenerator = ({ __index }) => {
  return __index || randomNumberGenerator(100, 1);
};

const booleanGenerator = () => {
  return !Math.round(Math.random());
};

const integerGenerator = ({ __range = "" }) => {
  const { min = 1, max = 10 } = getMinMax(__range);
  return randomNumberGenerator(max, min);
};

const floatGenerator = ({ __range = "", __tofix = 2 }) => {
  const { min = 1, max = 10 } = getMinMax(__range);
  return (randomNumberGenerator(max, min) * Math.random()).toFixed(__tofix);
};

const phoneNumberGenerator = () => {
  return `${phoneAreaList.random()}${randomNumberGenerator(
    999,
    200
  )}${randomNumberGenerator(9999, 2000)}`;
};

const zipCodeGenerator = () => {
  return `${randomNumberGenerator(99999, 10001)}`;
};

const domainNameGenerator = () => {
  return `${randomNumberGenerator() ? `https` : `http`}://${
    randomNumberGenerator() ? `www.` : ``
  }${wordGenerator()}.${domainList.random()}`;
};

const emailNameGenerator = () => {
  return `${wordGenerator()}@${emailDomainList.random()}`;
};

const dateGenerator = () => {
  const year = new Date().getFullYear();
  return `${randomNumberGenerator(12, 1)}-${randomNumberGenerator(
    28,
    1
  )}-${randomNumberGenerator(year, year - 25)}`;
};

const timeGenerator = () => {
  return `${randomNumberGenerator(12, 1)}:${randomNumberGenerator(59, 1)} ${
    randomNumberGenerator() ? "AM" : "PM"
  }`;
};

const dateTimeGenerator = () => {
  return new Date(`${dateGenerator()} ${timeGenerator()}`).toISOString();
};

const wordGenerator = () => {
  return wordList.random();
};

const titleGenerator = ({ __range = "" }) => {
  const { min, max = 10 } = getMinMax(__range);
  const limit = min ? randomNumberGenerator(max, min) : max;

  let result = [];
  for (let i = 0; i < limit; i++) {
    result.push(wordList.random());
  }
  return result.join(" ");
};

const textAreaGenerator = ({ __range = "" }) => {
  const { min, max = 10 } = getMinMax(__range);
  const limit = min ? randomNumberGenerator(max, min) : max;
  let result = [];
  for (let i = 0; i < limit; i++) {
    result.push(wordList.random());
  }
  return result.join(" ");
};

const imageUrlGenerator = () => {
  return `http://localhost:${config.appPort}/assets/${imageList.random()}`;
};

const tokenGenerator = payload => {
  return tokenEncode(payload);
};

const ipAddressGenerator = () => {
  return `${randomNumberGenerator(255)}.${randomNumberGenerator(
    255
  )}.${randomNumberGenerator(255)}.${randomNumberGenerator(255)}`;
};

const generator = {
  id: idGenerator,
  uuid: uuidGenerator,
  boolean: booleanGenerator,
  text: wordGenerator,
  title: titleGenerator,
  textarea: textAreaGenerator,
  integer: integerGenerator,
  float: floatGenerator,
  phone: phoneNumberGenerator,
  zipcode: zipCodeGenerator,
  date: dateGenerator,
  time: timeGenerator,
  "date-time": dateTimeGenerator,
  url: domainNameGenerator,
  email: emailNameGenerator,
  image: imageUrlGenerator,
  pdf: pdfGenerator,
  csv: csvGenerator,
  doc: docGenerator,
  token: tokenGenerator,
  ipaddress: ipAddressGenerator,
  default: wordGenerator
};

module.exports = generator;
