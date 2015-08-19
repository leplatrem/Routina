import React from "react";
import TestUtils from "react/lib/ReactTestUtils";
import { expect } from "chai";
import sinon from "sinon";
import Kinto from "kinto";
import moment from "moment";

import App, { Form, List, Item } from "../../scripts/components/App";
import { Store } from "../../scripts/store";
import { Routine } from "../../scripts/models";


describe("App", () => {

  var sandbox;
  var store;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const kinto = new Kinto();
    store = new Store(kinto, "items");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Component", () => {

    var rendered;

    beforeEach(() => {
      sandbox.stub(store, "create").returns(Promise.resolve({}));
      sandbox.stub(store, "delete").returns(Promise.resolve({}));
      sandbox.stub(store, "load").returns(Promise.resolve({}));
      sandbox.stub(store, "update").returns(Promise.resolve({}));
      sandbox.stub(store, "sync").returns(Promise.resolve({}));
      rendered = TestUtils.renderIntoDocument(<App store={store}/>);
    });

    it("loads items from store on mount", () => {
      sinon.assert.calledOnce(store.load);
    });

    it("enables autorefresh on load", () => {
      expect(store.autorefresh).to.be.false;
      store.emit("change", {items: []});
      expect(store.autorefresh).to.be.true;
    });

    it("renders items of store when store changes", () => {
      store.emit("change", {items: [new Routine(":)")]});
      let node = React.findDOMNode(rendered);
      expect(node.querySelector("li").textContent).to.contain(":)");
    });

    it("adds item to the store on form submit", () => {
      const node = React.findDOMNode(rendered).querySelector("input");
      TestUtils.Simulate.change(node, {target: {value: "Hello, world"}});
      TestUtils.Simulate.submit(node);
      var createArg = store.create.lastCall.args[0];
      expect(createArg.label).to.eql("Hello, world");
    });


    describe("Sync", () => {
      it("syncs store on button click", () => {
        const node = React.findDOMNode(rendered).querySelector("button.sync");
        TestUtils.Simulate.click(node);
        sinon.assert.calledOnce(store.sync);
      });

      it("disables button while store is busy", () => {
        store.emit("busy", true);
        const selector = ".disabled button.sync[disabled]";
        const node = React.findDOMNode(rendered);
        expect(node.querySelector(selector)).to.exist;
        store.emit("busy", false);
        expect(node.querySelector(selector)).to.not.exist;
      });

      it("changes button label and icon while store is busy", () => {
        store.emit("busy", true);
        const node = React.findDOMNode(rendered).querySelector("button.sync");
        expect(node.textContent).to.contain("Syncing...");
        expect(node.querySelector(".glyphicon-refresh")).to.exist;
      });

      it("shows message when error happens", () => {
        store.emit("error", new Error("Failed"));
        const node = React.findDOMNode(rendered);
        expect(node.querySelector(".error").textContent).to.eql("Failed");
      });

      it("clears error message on sync", () => {
        store.emit("error", new Error("Failed"));
        rendered.syncRecords();
        const node = React.findDOMNode(rendered);
        expect(node.querySelector(".error").textContent).to.eql("");
      });
    });


    describe("Authenticated", () => {
      const user = "abcde";

      beforeEach(() => {
        rendered = TestUtils.renderIntoDocument(<App store={store} user={user}/>);
      });

      it("sync records on mount if user is provided", () => {
        sinon.assert.calledOnce(store.sync);
      });

      it("shows a permalink with location hash", () => {
        var node = React.findDOMNode(rendered);
        var selector = "a[href='https://leplatrem.github.io/Routina/#" + user + "']"
        expect(node.querySelectorAll(selector).length).to.eql(1);
      })
    });


    describe("Offline", () => {
      beforeEach(() => {
        store.online = false;
      });

      it("disables the button while offline", () => {
        const selector = "button.sync[disabled]";
        const node = React.findDOMNode(rendered);
        expect(node.querySelector(selector)).to.exist;
      });

      it("shows a warning while offline", () => {
        const node = React.findDOMNode(rendered).querySelector("button.sync");
        expect(node.textContent).to.contain("Offline");
        expect(node.querySelector(".glyphicon-alert")).to.exist;
      });
    });


    describe("Editing", () => {

      var record;

      beforeEach(() => {
        record = new Routine("Existing");
        record.id = 42;

        // Fill list.
        store.emit("change", {items: [record]});
        const item = React.findDOMNode(rendered).querySelector("button.edit");
        // Set an item in edition mode.
        TestUtils.Simulate.click(item);
      });

      it("stops store autorefresh on edit", () => {
        expect(store.autorefresh).to.be.false;
      });

      it("updates item in the store on edit", () => {
        // Change and submit.
        const field = React.findDOMNode(rendered).querySelector("input[name='label']");
        TestUtils.Simulate.change(field, {target: {value: "Hola, mundo"}});
        TestUtils.Simulate.submit(field);
        var updateArg = store.update.lastCall.args[0];
        expect(updateArg.id).to.eql(42);
        expect(updateArg.label).to.eql("Hola, mundo");
      });

      it("deletes item from the store", () => {
        const button = React.findDOMNode(rendered).querySelector("button.delete");
        TestUtils.Simulate.click(button);
        sinon.assert.calledWithExactly(store.delete, record);
      });
    });
  });
});


describe("List", () => {

  var rendered;
  const items = [new Routine("Hello"), new Routine("World")];

  beforeEach(() => {
    rendered = TestUtils.renderIntoDocument(<List items={items}/>);
  });

  it("renders without problems", () => {
    expect(React.findDOMNode(rendered).tagName).to.equal("UL");
  });

  it("renders items in list", () => {
    expect(React.findDOMNode(rendered).querySelectorAll("li").length).to.equal(2);
  });


  describe("Editing", () => {

    var node;
    var editItemCallback, updateCallback, deleteCallback;

    beforeEach(() => {
      editItemCallback = sinon.spy();
      updateCallback = sinon.spy();
      deleteCallback = sinon.spy();
      rendered = TestUtils.renderIntoDocument(<List items={items} editItem={editItemCallback}
                                                                  updateRecord={updateCallback}
                                                                  deleteRecord={deleteCallback}/>);
      node = React.findDOMNode(rendered);

      TestUtils.Simulate.click(node.querySelector("li:first-child button.edit"));
      const field = node.querySelector("input[name='label']");
      TestUtils.Simulate.change(field, {target: {value: "Hola, mundo"}});
    });

    it("uses callback on edit", () => {
      sinon.assert.calledOnce(editItemCallback);
    });

    it("renders as form on item click", () => {
      expect(node.querySelectorAll("form").length).to.equal(1);
    });

    it("hides form after save", () => {
      TestUtils.Simulate.submit(node.querySelector("form"));
      expect(node.querySelectorAll("form").length).to.equal(0);
    });

    it("allows editing only one item at a time", () => {
      TestUtils.Simulate.click(node.querySelector("li:last-child button.edit"));
      expect(node.querySelectorAll("form").length).to.equal(1);
    });

    it("allows editing the same item several times", () => {
      TestUtils.Simulate.submit(node.querySelector("form"));
      TestUtils.Simulate.click(node.querySelector("li:first-child button.edit"));
      expect(node.querySelectorAll("form").length).to.equal(1);
    });

    it("cancels edition when other item is clicked", () => {
      TestUtils.Simulate.click(node.querySelector("li:last-child button.edit"));
      const form = node.querySelectorAll("li:first-child form");
      expect(form.length).to.equal(0);
    });

    it("uses callback on save", () => {
      TestUtils.Simulate.submit(node.querySelector("form"));
      var updateArg = updateCallback.lastCall.args[0];
      expect(updateArg.label).to.eql("Hola, mundo");
    });

    it("uses callback on delete", () => {
      TestUtils.Simulate.click(node.querySelector("li > button"));
      sinon.assert.calledOnce(deleteCallback);
    });

    it("hides form after delete", () => {
      TestUtils.Simulate.click(node.querySelector("li > button"));
      expect(node.querySelectorAll("form").length).to.equal(0);
    });
  });
});


describe("Item", () => {

  var rendered;
  var record;
  var node;

  beforeEach(() => {
    record = new Routine("Value", {value: 4, unit: "days"});
    record.check();
    rendered = TestUtils.renderIntoDocument(<Item item={record}/>);
    node = React.findDOMNode(rendered);
  });

  it("renders without problems", () => {
    expect(React.findDOMNode(rendered).tagName).to.equal("LI");
  });

  it("renders routine label in a routine span", () => {
    expect(node.querySelector("span.routine").textContent).to.equal("Value");
  });

  it("renders routine status in item class", () => {
    expect(node.className).to.contain("ok");
  });

  it("renders routine period in a period span", () => {
    expect(node.querySelector(".period").textContent).equal("Every4days");
    expect(node.querySelector(".period .value").textContent).equal("4");
    expect(node.querySelector(".period .unit").textContent).equal("days");
  });

  it("renders routine next occurence in a next span", () => {
    expect(node.querySelector(".next").textContent).to.contain("in");
  });

  it("renders routine last occurence in a last span", () => {
    expect(node.querySelector(".last").textContent).to.contain("ago");
  });

  it("display last as never if never checked", () => {
    rendered = TestUtils.renderIntoDocument(<Item item={new Routine()}/>);
    node = React.findDOMNode(rendered);
    expect(node.querySelector(".last").textContent).to.eql("Never");
  });

  it("display late if task is overdue", () => {
    const longTimeAgo = moment().subtract(6, "days").toDate();
    record.occurences = [longTimeAgo];
    rendered = TestUtils.renderIntoDocument(<Item item={record}/>);
    node = React.findDOMNode(rendered);
    expect(node.querySelector(".next").textContent).to.contain("late");
  });


  it("uses callback on edit", () => {
    var callback = sinon.spy();
    const item = TestUtils.renderIntoDocument(<Item item={record} onEdit={callback}/>);
    node = React.findDOMNode(item).querySelector("button.edit");
    TestUtils.Simulate.click(node);
    sinon.assert.calledOnce(callback);
  });

  it("checks routine and call save callback", () => {
    var callback = sinon.spy();
    const item = TestUtils.renderIntoDocument(<Item item={record} onSave={callback}/>);
    node = React.findDOMNode(item).querySelector("button.check");
    expect(record.occurences.length).to.eql(1);
    TestUtils.Simulate.click(node);
    expect(record.occurences.length).to.eql(2);
    sinon.assert.calledWithExactly(callback, record);
  });


  describe("Editing", () => {

    var saveCallback, deleteCallback;

    beforeEach(() => {
      saveCallback = sinon.spy();
      deleteCallback = sinon.spy();
      rendered = TestUtils.renderIntoDocument(<Item editing={true}
                                                    item={new Routine("Value")}
                                                    onSave={saveCallback}
                                                    onDelete={deleteCallback} />);
    });

    it("renders label in field value if editing", () => {
      var node = React.findDOMNode(rendered);
      expect(node.querySelector("input").value).to.equal("Value");
    });

    it("uses callback on save", () => {
      var newvalue = "Hello, world";
      var field = React.findDOMNode(rendered).querySelector("input[name='label']")
      TestUtils.Simulate.change(field, {target: {value: newvalue}});
      TestUtils.Simulate.submit(field);
      const saveArg = saveCallback.lastCall.args[0];
      expect(saveArg.label).to.eql(newvalue);
    });

    it("uses callback on delete", () => {
      const node = React.findDOMNode(rendered).querySelector("button.delete");
      TestUtils.Simulate.click(node);
      sinon.assert.calledOnce(deleteCallback);
    });
  });
});


describe("Form", () => {

  var rendered;

  beforeEach(() => {
    rendered = TestUtils.renderIntoDocument(<Form/>);
  });

  it("renders without problems", () => {
    expect(React.findDOMNode(rendered).tagName).to.equal("FORM");
  });

  it("shows add button if no record", () => {
    const button = React.findDOMNode(rendered).querySelector("button");
    expect(button.getAttribute("aria-label")).to.equal("Add");
  });

  it("sets placeholder if no record", () => {
    const button = React.findDOMNode(rendered).querySelector("input");
    expect(button.placeholder).to.equal("Label");
  });

  it("contains an fields with default values and a submit button", () => {
    const node = React.findDOMNode(rendered);
    expect(node.querySelector("input[name='label']").value).to.eql("New task");
    expect(node.querySelector("input[name='value']").value).to.eql("3");
    expect(node.querySelector("select[name='unit']").value).to.eql("days");
  });

  it("uses callback on submit", () => {
    const callback = sinon.spy();
    rendered = TestUtils.renderIntoDocument(<Form saveRecord={callback}/>);
    const field = React.findDOMNode(rendered).querySelector("input[name='label']")
    const newvalue = "Hola, mundo";
    TestUtils.Simulate.change(field, {target: {value: newvalue}});
    TestUtils.Simulate.submit(field);

    const saveArgs = callback.lastCall.args[0];
    expect(saveArgs.label).to.eql(newvalue);
    expect(saveArgs.period.value).to.eql(3);
    expect(saveArgs.period.unit).to.eql("days");
  });


  describe("Editing", () => {

    var callback;
    var record;

    beforeEach(() => {
      record = new Routine("Value", {value: 12, unit: "years"});
      record.id = 42;

      callback = sinon.spy();
      rendered = TestUtils.renderIntoDocument(<Form record={record}
                                                    saveRecord={callback} />);
    });

    it("renders record values in fields", () => {
      var node = React.findDOMNode(rendered);
      expect(node.querySelector("input[name='label']").value).to.equal("Value");
      expect(node.querySelector("input[name='value']").value).to.equal("12");
      expect(node.querySelector("select[name='unit']").value).to.equal("years");
    });

    it("updates its state when field change", () => {
      const newvalue = "Hola, mundo";
      const field = React.findDOMNode(rendered).querySelector("input[name='label']")
      TestUtils.Simulate.change(field, {target: {value: newvalue}});
      expect(rendered.state.record.label).to.equal(newvalue);
    });

    it("updates period attributes when fields change", () => {
      const newvalue = "days";
      const field = React.findDOMNode(rendered).querySelector("select[name='unit']")
      TestUtils.Simulate.change(field, {target: {value: newvalue}});
      expect(rendered.state.record.period.unit).to.equal(newvalue);
    });

    it("uses callback on submit", () => {
      const newvalue = "Hola, mundo";
      const field = React.findDOMNode(rendered).querySelector("input[name='label']")
      TestUtils.Simulate.change(field, {target: {value: newvalue}});
      TestUtils.Simulate.submit(field);

      const saveArgs = callback.lastCall.args[0];
      expect(saveArgs.label).to.eql(newvalue);
      expect(saveArgs.id).to.eql(record.id);
    });

    it("clears form on submit", () => {
      const node = React.findDOMNode(rendered);
      TestUtils.Simulate.submit(node);
      expect(rendered.state.record.label).to.equal("New task");
    });
  });
});
