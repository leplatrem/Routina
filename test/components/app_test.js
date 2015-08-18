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

    it("renders items of store when store changes", () => {
      store.emit("change", {items: [new Routine(":)")]});
      let node = React.findDOMNode(rendered);
      expect(node.querySelector("li").textContent).to.contain(":)");
    });

    it("adds item to the store on form submit", () => {
      const node = React.findDOMNode(rendered).querySelector("input");
      TestUtils.Simulate.change(node, {target: {value: "Hello, world"}});
      TestUtils.Simulate.submit(node);
      sinon.assert.calledWithExactly(store.create, {label: "Hello, world"});
    });

    it("syncs store on button click", () => {
      const node = React.findDOMNode(rendered).querySelector("div > button");
      TestUtils.Simulate.click(node);
      sinon.assert.calledOnce(store.sync);
    });

    it("disables button during sync", () => {
      rendered.syncRecords();
      let selector = ".disabled button[disabled]";
      let node = React.findDOMNode(rendered);
      expect(node.querySelector(selector)).to.exist;
      store.emit("change", {});
      expect(node.querySelector(selector)).to.not.exist;
    });

    it("shows message when error happens", () => {
      store.emit("error", new Error("Failed"));
      let node = React.findDOMNode(rendered);
      expect(node.querySelector(".error").textContent).to.eql("Failed");
    });

    it("clears error message on sync", () => {
      store.emit("error", new Error("Failed"));
      rendered.syncRecords();
      let node = React.findDOMNode(rendered);
      expect(node.querySelector(".error").textContent).to.eql("");
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

      it("updates item in the store on edit", () => {
        // Change and submit.
        const field = React.findDOMNode(rendered).querySelector("li > form > input");
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
    var updateCallback, deleteCallback;

    beforeEach(() => {
      updateCallback = sinon.spy();
      deleteCallback = sinon.spy();
      rendered = TestUtils.renderIntoDocument(<List items={items} updateRecord={updateCallback}
                                                                  deleteRecord={deleteCallback}/>);
      node = React.findDOMNode(rendered);

      TestUtils.Simulate.click(node.querySelector("li:first-child button.edit"));
      const field = node.querySelector("li > form > input");
      TestUtils.Simulate.change(field, {target: {value: "Hola, mundo"}});
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

  it("renders routine label in a label span", () => {
    expect(node.querySelector("span.label").textContent).to.equal("Value");
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
                                                    item={{label: "Value"}}
                                                    onSave={saveCallback}
                                                    onDelete={deleteCallback} />);
    });

    it("renders label in field value if editing", () => {
      var node = React.findDOMNode(rendered);
      expect(node.querySelector("input").value).to.equal("Value");
    });

    it("uses callback on save", () => {
      var newvalue = "Hello, world";
      var field = React.findDOMNode(rendered).querySelector("form > input")
      TestUtils.Simulate.change(field, {target: {value: newvalue}});
      TestUtils.Simulate.submit(field);
      sinon.assert.calledWithExactly(saveCallback, {label: newvalue});
    });

    it("uses callback on delete", () => {
      const node = React.findDOMNode(rendered).querySelector("li > button");
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
    expect(button.textContent).to.equal("Add");
  });

  it("sets placeholder if no record", () => {
    const button = React.findDOMNode(rendered).querySelector("input");
    expect(button.placeholder).to.equal("Label");
  });

  it("contains an input field and a submit button", () => {
    const selector = "button, input";
    const nodes = React.findDOMNode(rendered).querySelectorAll(selector);
    expect(nodes.length).to.equal(2);
  });

  it("uses callback on submit", () => {
    const callback = sinon.spy();
    rendered = TestUtils.renderIntoDocument(<Form saveRecord={callback}/>);
    const field = React.findDOMNode(rendered).querySelector("form > input")
    const newvalue = "Hola, mundo";
    TestUtils.Simulate.change(field, {target: {value: newvalue}});
    TestUtils.Simulate.submit(field);
    sinon.assert.calledWithExactly(callback, {label: newvalue});
  });


  describe("Editing", () => {

    var callback;
    const record = {id: "42", label: "Value"};

    beforeEach(() => {
      callback = sinon.spy();
      rendered = TestUtils.renderIntoDocument(<Form record={record}
                                                    saveRecord={callback} />);
    });

    it("renders label in field value if editing", () => {
      var node = React.findDOMNode(rendered);
      expect(node.querySelector("input").value).to.equal("Value");
    });

    it("updates its state when field change", () => {
      const newvalue = "Hola, mundo";
      const field = React.findDOMNode(rendered).querySelector("form > input")
      TestUtils.Simulate.change(field, {target: {value: newvalue}});
      expect(rendered.state.record.label).to.equal(newvalue);
    });

    it("uses callback on submit", () => {
      const newvalue = "Hola, mundo";
      const field = React.findDOMNode(rendered).querySelector("form > input")
      TestUtils.Simulate.change(field, {target: {value: newvalue}});
      TestUtils.Simulate.submit(field);
      sinon.assert.calledWithExactly(callback, {id: "42", label: newvalue});
    });

  });
});
