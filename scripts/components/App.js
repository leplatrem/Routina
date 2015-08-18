import React from "react";


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

  render() {
    if (this.props.editing) {
      return (
        <li key={this.props.key}>
          <Form record={this.props.item} saveRecord={this.props.onSave}/>
          <button onClick={this.props.onDelete}>Delete</button>
        </li>
      );
    }
    return (
      <li onClick={this.props.onEdit} key={this.props.key}>{this.props.item.label}</li>
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
