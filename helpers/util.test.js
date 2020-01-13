const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const jwt = require("jsonwebtoken");

const {
  uuid,
  getMinMax,
  tokenEncode,
  tokenDecode,
  checkObject,
  randomNumberGenerator,
  throwErrorForEmptyValue
} = require("./util");

// createSandbox
const sandbox = sinon.createSandbox();

describe("Util Helper", () => {
  const payload = {
    name: "sabbir",
    email: "some@email.com"
  };

  const encodedToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7Im5hbWUiOiJzYWJiaXIiLCJlbWFpbCI6InNvbWVAZW1haWwuY29tIn0sImlhdCI6MTU3ODk0MDU4OSwiZXhwIjozMTU3ODg0Nzc4fQ.nzQjmwcN9wI_5rC63477rghK_jmWV29PUqXbm-fSX8U";

  it("should  encode payload into token", done => {
    const token = tokenEncode({ payload });
    expect(token).to.be.not.null;
    done();
  });

  it("should call jwt func", done => {
    const jwtStub = sandbox.stub(jwt, "sign");

    const stub = jwtStub.returns(encodedToken);
    const token = tokenEncode({ payload });
    expect(token).to.be.not.null;
    expect(stub).to.have.been.called;
    done();
  });

  //
});
