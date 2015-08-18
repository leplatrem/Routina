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
    const creation = !record.id;
    return (
      <form onSubmit={this.onFormSubmit.bind(this)} className="form-inline fit hbox">
        <input autofocus name="label" type="text"
               placeholder="Label"
               value={record.label}
               onChange={this.onChange.bind(this, "label")}
               className="form-control fit" />
        <input name="value" type="number"
               value={record.period.value}
               onChange={this.onChange.bind(this, "value")}
               className="form-control" />
        <select name="unit"
                value={record.period.unit}
                onChange={this.onChange.bind(this, "unit")}
                className="form-control" >
          {Routine.units.map(u => <option value={u}>{u}</option>)}
        </select>
        <button className="btn btn-primary submit" type="submit" aria-label={creation ? "Add" : "Save"}>
          <span className={"glyphicon glyphicon-" + (creation ? "plus" : "ok")} aria-hidden="true"></span>
        </button>
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
        <li key={this.props.key} className="hbox nopad list-group-item">
          <button onClick={this.props.onDelete} className="btn btn-danger delete" aria-label="Delete">
            <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
          </button>
          <Form record={this.props.item} saveRecord={this.props.onSave}/>
        </li>
      );
    }

    const shorten = time => time ? time.replace(/minutes?/, "min.")
                                       .replace(/seconds?/, "sec.") : "";

    const item = this.props.item;
    const next = moment(item.next).fromNow().replace("ago", "late");
    const last = item.last ? shorten(moment(item.last).fromNow()) : "Never";
    const unit = shorten(item.period.unit);

    return (
      <li key={this.props.key} className={item.status + " hbox nopad list-group-item"}>
        <button onClick={this.onCheck.bind(this)} className="btn check" aria-label="Check">
          <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
        </button>
        <div>
          <span className="routine">{item.label}</span>
          <span className="next">{next}</span>
        </div>
        <div className="details pull-end">
          <span className="period">
            Every
            <span className="value">{item.period.value}</span>
            <span className="unit">{unit}</span>
          </span>
          <span className="last">{last}</span>
        </div>
        <button onClick={this.props.onEdit} className="btn edit" aria-label="Edit">
          <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
        </button>
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
      <ul className="list-group">{
        this.props.items.map((item, i) => {
          return <Item key={i}
                       item={item}
                       editing={i === this.state.current}
                       onEdit={this.onEdit.bind(this, i)}
                       onDelete={this.onDelete.bind(this, item)}
                       onSave={this.onSave.bind(this)} />;
        })}
      </ul>
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
      <section className={disabled}>
        <div className="error">{this.state.error}</div>
        <List editItem={this.editItem.bind(this)}
              updateRecord={this.updateRecord.bind(this)}
              deleteRecord={this.deleteRecord.bind(this)}
              items={this.state.items}/>
        <div className="hbox create">
          <Form saveRecord={this.createRecord.bind(this)}/>
        </div>
        <div className="hbox">
          <button className="btn sync fit" data-icon="sync" onClick={this.syncRecords.bind(this)} disabled={disabled}> Sync</button>
        </div>
      </section>
    );
  }
}
