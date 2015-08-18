import React from "react";
import moment from "moment";


export class Form extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      record: this.props.record || {}
    };
  }

  onFormSubmit(event) {
    event.preventDefault();
    this.props.saveRecord(this.state.record);
  }

  onChange(field, event) {
    var newrecord = Object.assign({}, this.state.record, {[field]: event.target.value});
    this.setState({record: newrecord});
  }

  render() {
    return (
      <form onSubmit={this.onFormSubmit.bind(this)}>
        <input autofocus name="label" type="text"
               placeholder="Label"
               value={this.state.record.label}
               onChange={this.onChange.bind(this, "label")} />
        <button type="submit">{this.props.record ? "Save" : "Add"}</button>
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
      this.setState(Object.assign({busy: false}, state));
    });
    this.props.store.on("error", error => {
      this.setState({busy: false, error: error.message});
    });
    this.props.store.load();
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
        <List updateRecord={this.updateRecord.bind(this)}
              deleteRecord={this.deleteRecord.bind(this)}
              items={this.state.items}/>
        <button onClick={this.syncRecords.bind(this)} disabled={disabled}>Sync!</button>
        <div className="error">{this.state.error}</div>
      </div>
    );
  }
}
