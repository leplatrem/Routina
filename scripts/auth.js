import btoa from "btoa";
import { v4 as uuid4 } from "uuid";
import { EventEmitter } from "events";


export class Auth extends EventEmitter {

  constructor(store) {
    super();
    this.server = '';
    this.store = store;
  }

  set config(config) {
    this.server = config.server;
  }

  loginURI(website) {
    const login = this.server.replace("v1", "fxa-oauth/login?redirect=");
    const currentWebsite = website.replace(/#.*/, '');
    const redirect = encodeURIComponent(currentWebsite + '#fxa:');
    return login + redirect;
  }

  authenticate() {
    var token = window.location.hash.slice(1);

    // Take last token from store or generate BasicAuth user with uuid4.
    if (!token) {
      token = this.store.getItem("lastToken") || uuid4();
    }
    this.store.setItem("lastToken", token);

    var credentials = {
      headers: {},
      userid: '',
      token: token,
      authenticated: false
    };

    if (token.indexOf('fxa:') === 0) {
      // Fxa token passed in URL from redirection.
      let bearerToken = token.replace('fxa:', '');
      credentials.headers.Authorization = 'Bearer ' + bearerToken;
      credentials.authenticated = true;
      // Forget token.
      credentials.token = '';
      window.location.hash = '';
    }
    else {
      // Token provided via hash, but no FxA.
      // Use Basic Auth as before.
      let userpass64 = btoa(token + ":s3cr3t");
      credentials.userid = userpass64;
      credentials.headers.Authorization = 'Basic ' + userpass64;
    }

    this.emit('login', credentials);
  }
}
