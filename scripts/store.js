import { EventEmitter } from "events";

import { Routine } from "./models";


export class Store extends EventEmitter {

  constructor(kinto, collection) {
    super();
    this.state = {items: []};
    this.collection = kinto.collection(collection);
  }

  deserialize(data) {
    return Routine.deserialize(data);
  }

  serialize(record) {
    return record.serialize();
  }

  onError(error) {
    this.emit("error", error);
  }

  load() {
    return this.collection.list()
      .then(res => {
        const instances = res.data.map(this.deserialize);
        this.state.items = instances;
        this.emit("change", this.state);
      })
      .catch(this.onError.bind(this));
  }

  create(record) {
    return this.collection.create(this.serialize(record))
      .then(res => {
        const instance = this.deserialize(res.data);
        this.state.items.push(instance);
        this.emit("change", this.state);
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
        this.emit('change', this.state);
      })
      .catch(this.onError.bind(this));
  }

  delete(record) {
    return this.collection.delete(record.id)
      .then(res => {
        this.state.items = this.state.items.filter(item => {
          return item.id !== record.id;
        });
        this.emit('change', this.state);
      })
      .catch(this.onError.bind(this));
  }

  sync() {
    return this.collection.sync()
      .then((res) => {
        if (res.ok) {
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
