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
import { Config } from "./config";
import Kinto from "kinto";

// Migrate from Routina v1.1.
window.localStorage.setItem("lastToken", (window.localStorage.getItem("lastuser") ||
                                          window.localStorage.getItem("lastToken")));

const auth = new Auth(window.localStorage);
const config = new Config(window.localStorage);
const store = new Store("routina-v1");

store.online = window.navigator.onLine;
window.addEventListener("offline", () => {store.online = false;});
window.addEventListener("online", () => {store.online = true;});

React.render(<App store={store} auth={auth} config={config}/>, document.getElementById("app"));
