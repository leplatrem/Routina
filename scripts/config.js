import { EventEmitter } from "events";

const DEFAULT_SERVER = "https://kinto.dev.mozaws.net/v1";


export class Config extends EventEmitter {

  constructor(store) {
    super();
    this.store = store;
  }

  load() {
    var server = this.store.getItem('server') || DEFAULT_SERVER;
    this.emit('configured', {
      server: server,
    });
  }
}
