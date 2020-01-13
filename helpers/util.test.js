const chai = require("chai");
const { expect } = chai;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const jwt = require("jsonwebtoken");

const { tokenEncode, tokenDecode, checkObject } = require("./util");

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
    jwtStub.restore();
    done();
  });

  it("should throw error for empty token", done => {
    tokenDecode("").catch(error => {
      expect(error.status).to.be.equal(404);
      done();
    });
  });

  it("should decoded token", done => {
    tokenDecode(encodedToken).then(decoded => {
      expect(decoded).to.have.property("payload");
      done();
    });
  });

  it("should equal two object", done => {
    const val = checkObject({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } });
    expect(val).to.be.equal(true);
    done();
  });
});
