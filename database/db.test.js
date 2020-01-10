const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const db = require("./connect");
const { create, get, update, remove } = require("./db");
const Q = require("q");

const sandbox = sinon.createSandbox();
// createSandbox

describe("DB spec", () => {
  let qStub;

  beforeEach(done => {
    qStub = sinon.stub(Q, "ninvoke");
    done();
  });

  afterEach(() => {
    // Restore the default sandbox here
    qStub.restore();
    // sandbox.restore();
  });

  it("should create new data", async () => {
    const data = {
      id: "some-random-uuid",
      name: "name-1"
    };
    const stub = qStub.resolves(data);
    const result = await create(data);
    expect(stub).to.have.been.called;
  });

  it("should throw error for creating new data", async () => {
    const data = {
      id: "some-random-uuid",
      name: "name-1"
    };
    const stub = qStub.rejects("something went wrong");
    const result = await create(data);
    expect(stub).to.have.been.called;
  });

  it("should get data", async () => {
    const query = {};
    const stub = qStub.resolves([{ id: "id-1", name: "name-1" }]);
    const result = await create(query);
    console.log({ result });
    expect(stub).to.have.been.called;
  });

  // it("should throw error for return data", async () => {
  //   const query = {};
  //   const stub = qStub.rejects("something went wrong");
  //   const result = await create(query);
  //   expect(stub).to.have.been.called;
  // });
});
