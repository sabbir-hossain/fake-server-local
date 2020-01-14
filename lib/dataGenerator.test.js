const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const generator = require("./dataGenerator");

describe("dataGenerator spec", () => {
  it("should return pdf link", done => {
    const result = generator.pdf();
    expect(result).to.be.not.null;
    done();
  });

  it("should return pdf link", done => {
    const result = generator.pdf();
    expect(result).to.be.not.null;
    done();
  });

  it("should return csv link", done => {
    const result = generator.csv();
    expect(result).to.be.not.null;
    done();
  });

  it("should return doc link", done => {
    const result = generator.doc();
    expect(result).to.be.not.null;
    done();
  });
});
