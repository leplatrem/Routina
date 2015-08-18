import { expect } from "chai";
import sinon from "sinon";
import Kinto from "kinto";

import { Store } from "../scripts/store";
import { Routine } from "../scripts/models";


describe("Store", () => {

  var sandbox;
  var store;

  var sample = {id: 1, label: "Hola!"};

  beforeEach((done) => {
    sandbox = sinon.sandbox.create();
    const kinto = new Kinto();
    store = new Store(kinto, "items");

    sandbox.stub(store.collection, "create")
      .returns(Promise.resolve({data: sample}));
    store.create(new Routine())
      .then(done);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("uses the specified collection name", () => {
    store.on("change", event => {
      const store = new Store(kinto, "articles");
      expect(store.collection.name).to.equal("articles");
    });
  });

  describe("#load()", () => {

    beforeEach(() => {
      sandbox.stub(store.collection, "list")
        .returns(Promise.resolve({data: [sample]}));
    });

    it("fills items and emits change", (done) => {
      store.on("change", event => {
        expect(store.state.items).to.eql([Routine.deserialize(sample)]);
        done();
      });
      store.load();
    });
  });


  describe("#create()", () => {

    it("adds Kinto record to its state and emits change", (done) => {
      store.on("change", event => {
        expect(event).to.eql({items: [Routine.deserialize(sample), Routine.deserialize(sample)]});
        done();
      });
      store.create(new Routine());
    });
  });


  describe("#update()", () => {

    const existing = {id: 1, label: "from db"};

    it("update() replaces with Kinto record and emits change", (done) => {
      sandbox.stub(store.collection, 'update')
        .returns(Promise.resolve({data: existing}));
      store.on('change', event => {
        expect(event).to.eql({items: [Routine.deserialize(existing)]});
        done();
      });

      const updated = Routine.deserialize({id: 1, label: "Mundo"});
      store.update(updated);
    });
  });


  describe("#delete()", () => {

    it("removes record and emits change", (done) => {
      sandbox.stub(store.collection, "delete")
        .returns(Promise.resolve({}));
      store.on('change', event => {
        expect(event).to.eql({items: []});
        done();
      });
      store.delete({id: 1, label: "Mundo"});
    });
  });


  describe("#sync()", () => {

    const existing = {label: "from db"};

    beforeEach(() => {
      sandbox.stub(store.collection, "sync")
        .returns(Promise.resolve({ok: true}));
      sandbox.stub(store.collection, "list")
        .returns(Promise.resolve({data: [existing]}));
    });

    it("reloads the local db after sync if ok", (done) => {
      store.on("change", event => {
        expect(event).to.eql({items: [Routine.deserialize(existing)]});
        done();
      });
      store.sync();
    });

    it("resolves conflicts using remote records", (done) => {
      const conflict = {remote: {id: 1, label: "remote"}};

      store.collection.sync
        .onFirstCall().returns(Promise.resolve({ok: false, conflicts: [conflict]}))
        .onSecondCall().returns(Promise.resolve({ok: true}));
      sandbox.stub(store.collection, "resolve").returns(Promise.resolve({}));

      store.on("change", event => {
        sinon.assert.calledWithExactly(store.collection.resolve, conflict, conflict.remote);
        done();
      });
      store.sync();
    });

    it("emits error when fails", (done) => {
      store.collection.sync.returns(Promise.reject(new Error("Server down")));
      store.on("error", error => {
        expect(error.message).to.eql("Server down");
        done();
      });
      store.sync();
    });
  });
});
