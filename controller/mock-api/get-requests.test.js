const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const getRequestsController = require("./get-requests");
const RecordModel = require("../../model/record");
const Generator = require("../../lib/generator");

const sandbox = sinon.createSandbox();
// createSandbox

describe("Get Request Controller", () => {
  let ctx, getByIdStub, processStub;
  beforeEach(done => {
    ctx = {
      request: {
        url: "/backoffice/test01"
      }
    };
    getByIdStub = sandbox.stub(RecordModel, "getById");
    processStub = sandbox.stub(Generator, "process");
    done();
  });

  afterEach(() => {
    // Restore the default sandbox here
    sandbox.restore();
  });

  it("should stub RecordModel getById", async () => {
    const stub = getByIdStub.returns({ schema: { id: "uuid", name: "text" } });
    await getRequestsController(ctx);
    expect(stub).to.have.been.called;
  });

  it("should stub RecordModel getById and process", async () => {
    const stub = getByIdStub.returns({ schema: { id: "uuid", name: "text" } });

    const procStub = processStub.returns({
      id: "292bb9c0-33da-11ea-8b98-a90e1f517c76",
      name: "eam"
    });
    await getRequestsController(ctx);
    expect(stub).to.have.been.called;
    expect(procStub).to.have.been.called;
  });

  it("should stub with throw response", async () => {
    const stub = getByIdStub.throws("something went wrong");
    await getRequestsController(ctx);
    expect(stub).to.have.been.called;
  });
});
