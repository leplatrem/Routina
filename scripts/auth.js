import btoa from "btoa";
import { v4 as uuid4 } from "uuid";
import { EventEmitter } from "events";


export class Auth extends EventEmitter {

  constructor(server, store) {
    super();
    this.server = server;
    this.store = store;

    /*
    navigator.mozId.watch({
      wantIssuer: 'firefox-accounts',
      audience: 'https://token.services.mozilla.com/',
      onlogin: function(assertion) {
        console.log('onlogin', assertion);

        // Trade Assertion for BearerToken on Firefox Account server
        // /ping fermj :)

      },
      onerror: function(error) {
        console.error(error);
      },
      onlogout: function() {
        console.log('onlogout');
      },
      onready: function() {
        console.log('onready');
      }
    });
    */
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
    /*

      navigator.mozId.request({
        oncancel: function() {
          console.log('User killed dialog.');
        }
      });

    */
    var userid = '';
    var headers = {};

    this.store.setItem("lastToken", token);
    this.authenticated = false;

    if (token.indexOf('fxa:') === 0) {
      // Fxa token passed in URL from redirection.
      let bearerToken = token.replace('fxa:', '');
      headers.Authorization = 'Bearer ' + bearerToken;
      this.authenticated = true;
    }
    else {
      // Token provided via hash, but no FxA.
      // Use Basic Auth as before.
      let userpass64 = btoa(token + ":s3cr3t");
      userid = userpass64;
      headers.Authorization = 'Basic ' + userpass64;
    }

    this.emit('login', {userid: userid, headers: headers});
  }
}
