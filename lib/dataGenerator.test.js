const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const generator = require("./dataGenerator");
const helper = require("../helpers/util");

describe("dataGenerator spec", () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.spy(helper, "randomNumberGenerator");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return non-empty result", done => {
    const pdf = generator.pdf();
    expect(pdf).to.be.not.null;

    const csv = generator.csv();
    expect(csv).to.be.not.null;

    const doc = generator.doc();
    expect(doc).to.be.not.null;

    const uuid = generator.uuid();
    expect(uuid).to.be.not.null;

    const id = generator.id({});
    expect(id).to.be.not.null;

    const boolean = generator.boolean();
    expect(boolean).to.be.not.null;

    done();
  });

  it("should return integer number", async () => {
    const result = generator.integer({});
    expect(helper.randomNumberGenerator).to.have.been.called;
  });
});
