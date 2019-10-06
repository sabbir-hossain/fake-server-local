const {
  wordList,
  imageList,
  numberList,
  domainList,
  phoneAreaList,
  emailDomainList
} = require("./storage");

const {
  uuid,
  tokenEncode,
  randomNumberGenerator,
  throwErrorForEmptyValue
} = require("../helpers/util");

const config = require("../config");

Array.prototype.random = function() {
  return this[Math.round(Math.random() * (this.length - 1))];
};

const uuidGenerator = () => {
  return uuid();
};

const idGenerator = index => {
  return index;
};

const booleanGenerator = () => {
  return !Math.round(Math.random());
};

const numberGenerator = (maxLimit = 10, minLimit = 2) => {
  const len = randomNumberGenerator(maxLimit, minLimit);
  const result = [];
  for (let i = 0; i < len; i++) {
    result.push(numberList.random());
  }
  return parseInt(result.join(""), 10);
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
  return `${dateGenerator()} ${timeGenerator()}`;
};

const wordGenerator = () => {
  return wordList.random();
};

const titleGenerator = (max = 5, min = 2) => {
  const limit = randomNumberGenerator(max, min);
  let result = [];
  for (let i = 0; i < limit; i++) {
    result.push(wordList.random());
  }
  return result.join(" ");
};

const textAreaGenerator = (max = 50, min = 10) => {
  const limit = randomNumberGenerator(max, min);
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

const generator = {
  id: idGenerator,
  uuid: uuidGenerator,
  boolean: booleanGenerator,
  text: wordGenerator,
  title: titleGenerator,
  textarea: textAreaGenerator,
  number: numberGenerator,
  phone: phoneNumberGenerator,
  zipcode: zipCodeGenerator,
  date: dateGenerator,
  time: timeGenerator,
  "date-time": dateTimeGenerator,
  url: domainNameGenerator,
  email: emailNameGenerator,
  image: imageUrlGenerator,
  token: tokenGenerator,
  default: wordGenerator
};

module.exports = generator;
