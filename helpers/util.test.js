const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const {
  uuid,
  getMinMax,
  tokenEncode,
  tokenDecode,
  checkObject,
  randomNumberGenerator,
  throwErrorForEmptyValue
} = require("./util");

describe("Util Helper", () => {});
