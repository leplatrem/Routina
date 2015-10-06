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

// Migrate from Routina v1.1.
window.localStorage.setItem("lastuser", window.localStorage.getItem("lastuser"));

// Authenticate using location hash.
const auth = new Auth(server, window.localStorage);

const kinto = new Kinto({remote: server});

const store = new Store(kinto, "routina-v1");

store.online = window.navigator.onLine;
window.addEventListener("offline", () => {store.online = false;});
window.addEventListener("online", () => {store.online = true;});

React.render(<App store={store} auth={auth}/>, document.getElementById("app"));
