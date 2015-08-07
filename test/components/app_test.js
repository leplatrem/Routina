import React from "react";
import TestUtils from "react/lib/ReactTestUtils";
import { expect } from "chai";
import sinon from "sinon";
import Kinto from "kinto";

import App, { Form, List, Item } from "../../scripts/components/App";
import { Store } from "../../scripts/store";


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
      sandbox.stub(store, "load").returns(Promise.resolve({}));
      sandbox.stub(store, "update").returns(Promise.resolve({}));
      sandbox.stub(store, "sync").returns(Promise.resolve({}));
      rendered = TestUtils.renderIntoDocument(<App store={store}/>);
    });

    it("loads items from store on mount", () => {
      sinon.assert.calledOnce(store.load);
    });

    it("renders items of store when store changes", () => {
      store.emit("change", {items: [{id: "id", label: ":)"}]});
      let node = React.findDOMNode(rendered);
      expect(node.querySelector("li").textContent).to.eql(":)");
    });

    it("adds item to the store on form submit", () => {
      const node = React.findDOMNode(rendered).querySelector("input");
      TestUtils.Simulate.change(node, {target: {value: "Hello, world"}});
      TestUtils.Simulate.submit(node);
      sinon.assert.calledWithExactly(store.create, {label: "Hello, world"});
    });

    it("updates item in the store on edit", () => {
      // Fill list.
      store.emit("change", {items: [{label: "Existing"}]});
      const item = React.findDOMNode(rendered).querySelector("li");
      // Set an item in edition mode.
      TestUtils.Simulate.click(item);
      // Change and submit.
      const field = React.findDOMNode(rendered).querySelector("li > form > input");
      TestUtils.Simulate.change(field, {target: {value: "Hola, mundo"}});
      TestUtils.Simulate.submit(field);
      // Check that store was updated.
      sinon.assert.calledWithExactly(store.update, {label: "Hola, mundo"});
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

    it("renders items of store when store changes", () => {
      store.emit("change", {items: [{id: "id", label: ":)"}]});
      let node = React.findDOMNode(rendered);
      expect(node.querySelector("li").textContent).to.eql(":)");
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
  });
});


describe("List", () => {

  var rendered;
  const items = [{label: "Hello"}, {label: "World"}];

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
    var callback;

    beforeEach(() => {
      callback = sinon.spy();
      rendered = TestUtils.renderIntoDocument(<List items={items} updateRecord={callback}/>);
      node = React.findDOMNode(rendered);

      TestUtils.Simulate.click(node.querySelector("li:first-child"));
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
      TestUtils.Simulate.click(node.querySelector("li:last-child"));
      expect(node.querySelectorAll("form").length).to.equal(1);
    });

    it("allows editing the same item several times", () => {
      TestUtils.Simulate.submit(node.querySelector("form"));
      TestUtils.Simulate.click(node.querySelector("li:first-child"));
      expect(node.querySelectorAll("form").length).to.equal(1);
    });

    it("cancels edition when other item is clicked", () => {
      TestUtils.Simulate.click(node.querySelector("li:last-child"));
      const label = node.querySelector("li:first-child");
      expect(React.findDOMNode(label).textContent).to.equal("Hello");
    });

    it("uses callback on save", () => {
      TestUtils.Simulate.submit(node.querySelector("form"));
      sinon.assert.calledWithExactly(callback, {label: "Hola, mundo"});
    });
  });
});


describe("Item", () => {

  var rendered;

  beforeEach(() => {
    rendered = TestUtils.renderIntoDocument(<Item item={{label: "Value"}}/>);
  });

  it("renders without problems", () => {
    expect(React.findDOMNode(rendered).tagName).to.equal("LI");
  });

  it("renders label in item text", () => {
    var node = React.findDOMNode(rendered);
    expect(node.textContent).to.equal("Value");
  });

  it("uses callback on edit", () => {
    var callback = sinon.spy();
    const item = TestUtils.renderIntoDocument(<Item item={{}} onEdit={callback}/>);
    TestUtils.Simulate.click(React.findDOMNode(item));
    sinon.assert.calledWithExactly(callback, item);
  });


  describe("Editing", () => {

    var callback;

    beforeEach(() => {
      callback = sinon.spy();
      rendered = TestUtils.renderIntoDocument(<Item editing={true}
                                                    item={{label: "Value"}}
                                                    onSave={callback} />);
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
      sinon.assert.calledWithExactly(callback, {label: newvalue});
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
