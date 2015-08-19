import { EventEmitter } from "events";

import { Routine } from "./models";


export class Store extends EventEmitter {

  constructor(kinto, collection) {
    super();
    this.state = {items: [], online: true, busy: false};
    this.collection = kinto.collection(collection);
  }

  deserialize(data) {
    return Routine.deserialize(data);
  }

  serialize(record) {
    return record.serialize();
  }

  set online(state) {
    this.state.online = state;
    this.emit("online", state);
  }

  get online () {
    return this.state.online;
  }

  set busy(state) {
    this.state.busy = state;
    this.emit("busy", state);
  }

  get busy () {
    return this.state.busy;
  }

  set autorefresh(state) {
    if (state) {
      if (!this._timer)
        this._timer = setInterval(this.emitChange.bind(this), 5000);
    }
    else if (this._timer) {
      this._timer = clearInterval(this._timer);
    }
  }

  get autorefresh() {
    return !!this._timer;
  }

  onError(error) {
    this.busy = false;
    this.emit("error", error);
  }

  emitChange() {
    const sorted = this.state.items.sort((a, b) => a.timeleft - b.timeleft);
    this.emit("change", this.state);
  }

  load() {
    return this.collection.list()
      .then(res => {
        const instances = res.data.map(this.deserialize);
        this.state.items = instances;
        this.emitChange();
      })
      .catch(this.onError.bind(this));
  }

  create(record) {
    return this.collection.create(this.serialize(record))
      .then(res => {
        const instance = this.deserialize(res.data);
        this.state.items.push(instance);
        this.emitChange();
      })
      .catch(this.onError.bind(this));
  }

  update(record) {
    return this.collection.update(this.serialize(record))
      .then(res => {
        this.state.items = this.state.items.map(item => {
          const instance = this.deserialize(res.data);
          return item.id === record.id ? instance : item;
        });
        this.emitChange();
      })
      .catch(this.onError.bind(this));
  }

  delete(record) {
    return this.collection.delete(record.id)
      .then(res => {
        this.state.items = this.state.items.filter(item => {
          return item.id !== record.id;
        });
        this.emitChange();
      })
      .catch(this.onError.bind(this));
  }

  sync() {
    if (!this.state.online) {
      return;
    }

    this.busy = true;
    return this.collection.sync()
      .then((res) => {
        if (res.ok) {
          this.busy = false;
          return this.load();
        }

        // If conflicts, take remote version and sync again (recursively).
        return Promise.all(res.conflicts.map(conflict => {
          return this.collection.resolve(conflict, conflict.remote);
        }))
        .then(_ => this.sync());
      })
      .catch(this.onError.bind(this));
  }
}
