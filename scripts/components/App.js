import React from "react";
import moment from "moment";


import { Routine } from "../../scripts/models";


export class Form extends React.Component {

  constructor(props) {
    super(props);
    this.state = {record: this.props.record || this.newRoutine()};
  }

  newRoutine() {
    return new Routine("New task", {value: 3, unit: "days"});
  }

  onFormSubmit(event) {
    event.preventDefault();
    this.props.saveRecord(this.state.record);
    this.setState({record: this.newRoutine()});
  }

  onChange(field, event) {
    var value = event.target.value;
    switch (field) {
      case "value":
        value = parseInt(value, 10);
      case "unit":
        Object.assign(this.state.record.period, {[field]: value});
        break;
      default:
        Object.assign(this.state.record, {[field]: value});
    }
    this.setState({record: this.state.record});
  }

  render() {
    const record = this.state.record;
    return (
      <form onSubmit={this.onFormSubmit.bind(this)}>
        <input autofocus name="label" type="text"
               placeholder="Label"
               value={record.label}
               onChange={this.onChange.bind(this, "label")} />
        <input name="value" type="number"
               value={record.period.value}
               onChange={this.onChange.bind(this, "value")} />
        <select name="unit"
                value={record.period.unit}
                onChange={this.onChange.bind(this, "unit")}>
          {Routine.units.map(u => <option value={u}>{u}</option>)}
        </select>
        <button className="submit" type="submit">{record.id ? "Save" : "Add"}</button>
      </form>
    );
  }
}


export class Item extends React.Component {

  static get defaultProps() {
    return {
      onEdit: () => {},
      onDelete: () => {},
      onSave: () => {}
    };
  }

  onCheck() {
    this.props.item.check();
    this.props.onSave(this.props.item);
  }

  render() {
    if (this.props.editing) {
      return (
        <li key={this.props.key}>
          <Form record={this.props.item} saveRecord={this.props.onSave}/>
          <button className="delete" onClick={this.props.onDelete}>Delete</button>
        </li>
      );
    }

    const item = this.props.item;
    const next = moment(item.next).fromNow().replace("ago", "late");
    const last = item.last ? moment(item.last).fromNow() : "Never";

    return (
      <li key={this.props.key} className={item.status}>
        <button className="check" onClick={this.onCheck.bind(this)}>&#x2713;</button>
        <span className="next">{next}</span>
        <span className="label">{item.label}</span>
        <span className="last">{last}</span>
        <span className="period">
          Every
          <span className="value">{item.period.value}</span>
          <span className="unit">{item.period.unit}</span>
        </span>
        <button className="edit" onClick={this.props.onEdit}>Edit</button>
      </li>
    );
  }
}


export class List extends React.Component {

  static get defaultProps() {
    return {
      editItem: () => {},
      updateRecord: () => {},
      deleteRecord: () => {},
    };
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  onEdit(index) {
    this.setState({current: index});
    this.props.editItem(index);
  }

  onSave(record) {
    this.setState({current: null});
    this.props.updateRecord(record);
  }

  onDelete(record) {
    this.setState({current: null});
    this.props.deleteRecord(record);
  }

  render() {
    return (
      <ul>{
        this.props.items.map((item, i) => {
          return <Item key={i}
                       item={item}
                       editing={i === this.state.current}
                       onEdit={this.onEdit.bind(this, i)}
                       onDelete={this.onDelete.bind(this, item)}
                       onSave={this.onSave.bind(this)} />;
        })
      }</ul>
    );
  }
}


export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.props.store.state;
    this.props.store.on("change", state => {
      this.props.store.autorefresh = true;
      this.setState(Object.assign({busy: false}, state));
    });
    this.props.store.on("error", error => {
      this.props.store.autorefresh = true;
      this.setState({busy: false, error: error.message});
    });
    this.props.store.load();
  }

  editItem() {
    // Stop auto-refresh while item is being edited.
    this.props.store.autorefresh = false;
  }

  createRecord(record) {
    this.props.store.create(record);
  }

  deleteRecord(record) {
    this.props.store.delete(record);
  }

  updateRecord(record) {
    this.props.store.update(record);
  }

  syncRecords() {
    this.setState({busy: true, error: ""});
    this.props.store.sync();
  }

  render() {
    var disabled = this.state.busy ? "disabled" : "";
    return (
      <div className={disabled}>
        <Form saveRecord={this.createRecord.bind(this)}/>
        <List editItem={this.editItem.bind(this)}
              updateRecord={this.updateRecord.bind(this)}
              deleteRecord={this.deleteRecord.bind(this)}
              items={this.state.items}/>
        <button onClick={this.syncRecords.bind(this)} disabled={disabled}>Sync!</button>
        <div className="error">{this.state.error}</div>
      </div>
    );
  }
}
