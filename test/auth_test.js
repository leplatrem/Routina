import { expect } from "chai";
import sinon from "sinon";

import { Auth } from "../scripts/auth";


class FakeStorage {
  setItem() {}
  getItem() {}
}


describe("Auth", () => {

  var sandbox;
  var auth;
  var store;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    store = new FakeStorage();
    auth = new Auth('http://server/v1', store);
  });

  afterEach(() => {
    sandbox.restore();
  });


  describe("#loginURI", () => {

    it("contains an encoded version of URL with hash", () => {
      var result = auth.loginURI("http://routina.com");
      var base = "http://server/v1/fxa-oauth/login?redirect="
      expect(result).to.eql(base + "http%3A%2F%2Froutina.com%23fxa%3A");
    });

  });


  describe("#authenticate()", () => {

    it("takes last token from store to authenticate", () => {
      sandbox.stub(store, "getItem").returns('existing');
      auth.authenticate('');
      expect(auth.headers.Authorization).to.eql('Basic ZXhpc3Rpbmc6czNjcjN0');
    });

    it("generates a basic token if no token in store", () => {
      auth.authenticate('');
      expect(auth.headers.Authorization).to.contain('Basic');
    });

    it("puts the token in store if provided", () => {
      sandbox.stub(store, "setItem");
      auth.authenticate('family-tasks');
      sinon.assert.calledWithExactly(store.setItem, 'lastToken', 'family-tasks');
    });

    it("sets bearer token if token is prefixed with fxa", () => {
      auth.authenticate('fxa:1234567');
      expect(auth.headers.Authorization).to.eql('Bearer 1234567');
    });
  });
});
