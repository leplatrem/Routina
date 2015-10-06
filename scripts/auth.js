import btoa from "btoa";
import { v4 as uuid4 } from "uuid";
import { EventEmitter } from "events";


export class Auth extends EventEmitter {

  constructor(server, store) {
    super();
    this.server = server;
    this.store = store;
    this.headers = {};
    this.token = null;
  }

  loginURI(website) {
    const login = this.server.replace("v1", "fxa-oauth/login?redirect=");
    const currentWebsite = website.replace(/#.*/, '');
    const redirect = encodeURIComponent(currentWebsite + '#fxa:');
    return login + redirect;
  }

  authenticate(token='') {
    // Take last token from store or generate BasicAuth user with uuid4.
    if (!token) {
      token = this.store.getItem("lastToken") || uuid4();
    }
    this.token = token;
    this.store.setItem("lastToken", token);
    this.authenticated = false;

    if (token.indexOf('fxa:') === 0) {
      // Fxa token passed in URL from redirection.
      let bearerToken = token.replace('fxa:', '');
      this.headers.Authorization = 'Bearer ' + bearerToken;
      this.authenticated = true;
      this.token = '';  // Forget token.
      this.userid = '';  // XXX: fetch from profile server.
    }
    else {
      // Token provided via hash, but no FxA.
      // Use Basic Auth as before.
      let userpass64 = btoa(token + ":s3cr3t");
      this.userid = userpass64;
      this.headers.Authorization = 'Basic ' + userpass64;
    }
  }
}
