/*
 * Webpack inclusions.
 */
require("bootstrap/less/bootstrap.less");
require("../styles/main.less");

/*
 * Routina.
 */
import "babel/polyfill";
import React from "react";
import App from "./components/App";
import { Store } from "./store";
import { Auth } from "./auth";
import Kinto from "kinto";

const server = "https://kinto.dev.mozaws.net/v1";

const auth = new Auth(server, window.localStorage);
auth.authenticate(window.location.hash.slice(1));
window.location.hash = auth.token;

const headers = Object.assign({}, auth.headers);
const kinto = new Kinto({remote: server, headers: headers});

const store = new Store(kinto, "routina-v1");
store.online = window.navigator.onLine;
window.addEventListener("offline", () => {store.online = false;});
window.addEventListener("online", () => {store.online = true;});

// Make sure local data depend on current user.
// Note: Kinto.js will have an option: https://github.com/Kinto/kinto.js/pull/111
store.collection.db.dbname = auth.token + store.collection.db.dbname;

React.render(<App store={store} auth={auth}/>, document.getElementById("app"));
