import "babel/polyfill";
import btoa from "btoa";
import { v4 as uuid4 } from "uuid";
import React from "react";
import App from "./components/App";
import { Store } from "./store";
import Kinto from "kinto";

// Take username from location hash or local storage.
var user = window.location.hash.slice(1);
if (!user) {
  user = window.localStorage.getItem("lastuser") || uuid4();
  window.localStorage.setItem("lastuser", user);
  window.location.hash = user;
}

// Use Mozilla demo server with Basic authentication:
const server = "https://kinto.dev.mozaws.net/v1";
const userpass64 = btoa(user + ":s3cr3t");
const auth = "Basic " + userpass64;
const kinto = new Kinto({remote: server, headers: {Authorization: auth}});

const store = new Store(kinto, "routina-v1");

// Make sure local data depend on current user.
// Note: Kinto.js will have an option: https://github.com/Kinto/kinto.js/pull/111
store.collection.db.dbname = userpass64 + store.collection.db.dbname;

React.render(<App store={store}/>, document.getElementById("app"));
