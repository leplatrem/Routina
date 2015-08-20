webpackJsonp([0],{0:function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{"default":e}}n(72);var o=n(240),r=i(o),a=n(245),s=n(247),l=i(s),u=n(402),c=i(u),d=n(492),f=n(494),h=i(f);n(556),n(565);var p=window.location.hash.slice(1);p||(p=window.localStorage.getItem("lastuser")||a.v4(),window.localStorage.setItem("lastuser",p),window.location.hash=p);var m="https://kinto.dev.mozaws.net/v1",b=r["default"](p+":s3cr3t"),y="Basic "+b,v=new h["default"]({remote:m,headers:{Authorization:y}}),g=new d.Store(v,"routina-v1");g.online=window.navigator.onLine,window.addEventListener("offline",function(){g.online=!1}),window.addEventListener("online",function(){g.online=!0}),g.collection.db.dbname=b+g.collection.db.dbname,l["default"].render(l["default"].createElement(c["default"],{store:g,user:p}),document.getElementById("app"))},240:function(e,t,n){(function(t){!function(){"use strict";function n(e){var n;return n=e instanceof t?e:new t(e.toString(),"binary"),n.toString("base64")}e.exports=n}()}).call(t,n(241).Buffer)},402:function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{"default":e}}function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),l=function(e,t,n){for(var i=!0;i;){var o=e,r=t,a=n;s=u=l=void 0,i=!1,null===o&&(o=Function.prototype);var s=Object.getOwnPropertyDescriptor(o,r);if(void 0!==s){if("value"in s)return s.value;var l=s.get;return void 0===l?void 0:l.call(a)}var u=Object.getPrototypeOf(o);if(null===u)return void 0;e=u,t=r,n=a,i=!0}},u=n(247),c=i(u),d=n(403),f=i(d),h=n(491),p=function(e){function t(e){r(this,t),l(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e),this.state={record:this.props.record||this.newRoutine()}}return a(t,e),s(t,[{key:"newRoutine",value:function(){return new h.Routine("",{value:3,unit:"days"})}},{key:"onFormSubmit",value:function(e){e.preventDefault(),this.props.saveRecord(this.state.record),this.setState({record:this.newRoutine()})}},{key:"onChange",value:function(e,t){var n=t.target.value;switch(e){case"value":n=parseInt(n,10);case"unit":Object.assign(this.state.record.period,o({},e,n));break;default:Object.assign(this.state.record,o({},e,n))}this.setState({record:this.state.record})}},{key:"render",value:function(){var e=this.state.record,t=!e.id;return c["default"].createElement("form",{onSubmit:this.onFormSubmit.bind(this),className:"form-inline fit hbox"},c["default"].createElement("input",{autofocus:!0,name:"label",type:"text",placeholder:"New habit",value:e.label,onChange:this.onChange.bind(this,"label"),className:"form-control fit"}),c["default"].createElement("input",{name:"value",type:"number",value:e.period.value,onChange:this.onChange.bind(this,"value"),className:"form-control"}),c["default"].createElement("select",{name:"unit",value:e.period.unit,onChange:this.onChange.bind(this,"unit"),className:"form-control"},h.Routine.units.map(function(e){return c["default"].createElement("option",{value:e},e)})),c["default"].createElement("button",{className:"btn btn-primary submit",type:"submit","aria-label":t?"Add":"Save"},c["default"].createElement("span",{className:"glyphicon glyphicon-"+(t?"plus":"ok"),"aria-hidden":"true"})))}}]),t}(c["default"].Component);t.Form=p;var m=function(e){function t(){r(this,t),l(Object.getPrototypeOf(t.prototype),"constructor",this).apply(this,arguments)}return a(t,e),s(t,[{key:"onCheck",value:function(){this.props.item.check(),this.props.onSave(this.props.item)}},{key:"render",value:function(){if(this.props.editing)return c["default"].createElement("li",{key:this.props.key,className:"hbox nopad list-group-item"},c["default"].createElement("button",{onClick:this.props.onDelete,className:"btn btn-danger delete","aria-label":"Delete"},c["default"].createElement("span",{className:"glyphicon glyphicon-trash","aria-hidden":"true"})),c["default"].createElement(p,{record:this.props.item,saveRecord:this.props.onSave}));var e=function(e){return e?e.replace(/minutes?/,"min.").replace(/seconds?/,"sec."):""},t=this.props.item,n=f["default"](t.next).fromNow().replace("ago","late"),i=t.last?e(f["default"](t.last).fromNow()):"Never",o=e(t.period.unit);return c["default"].createElement("li",{key:this.props.key,className:t.status+" hbox nopad list-group-item"},c["default"].createElement("button",{onClick:this.onCheck.bind(this),className:"btn check","aria-label":"Check"},c["default"].createElement("span",{className:"glyphicon glyphicon-exclamation-sign","aria-hidden":"true"})),c["default"].createElement("div",null,c["default"].createElement("span",{className:"routine"},t.label),c["default"].createElement("span",{className:"next"},n)),c["default"].createElement("div",{className:"details pull-end"},c["default"].createElement("span",{className:"period"},"Every",c["default"].createElement("span",{className:"value"},t.period.value),c["default"].createElement("span",{className:"unit"},o)),c["default"].createElement("span",{className:"last"},i)),c["default"].createElement("button",{onClick:this.props.onEdit,className:"btn default edit","aria-label":"Edit"},c["default"].createElement("span",{className:"glyphicon glyphicon-pencil","aria-hidden":"true"})))}}],[{key:"defaultProps",get:function(){return{onEdit:function(){},onDelete:function(){},onSave:function(){}}}}]),t}(c["default"].Component);t.Item=m;var b=function(e){function t(e){r(this,t),l(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e),this.state={}}return a(t,e),s(t,null,[{key:"defaultProps",get:function(){return{editItem:function(){},updateRecord:function(){},deleteRecord:function(){}}}}]),s(t,[{key:"onEdit",value:function(e){this.setState({current:e}),this.props.editItem(e)}},{key:"onSave",value:function(e){this.setState({current:null}),this.props.updateRecord(e)}},{key:"onDelete",value:function(e){this.setState({current:null}),this.props.deleteRecord(e)}},{key:"render",value:function(){var e=this;return c["default"].createElement("ul",{className:"list-group"},this.props.items.map(function(t,n){return c["default"].createElement(m,{key:n,item:t,editing:n===e.state.current,onEdit:e.onEdit.bind(e,n),onDelete:e.onDelete.bind(e,t),onSave:e.onSave.bind(e)})}))}}]),t}(c["default"].Component);t.List=b;var y=function(e){function t(e){r(this,t),l(Object.getPrototypeOf(t.prototype),"constructor",this).call(this,e),this.state=this.props.store.state,this.props.store.load(),this.props.user&&this.syncRecords()}return a(t,e),s(t,[{key:"componentDidMount",value:function(){var e=this;this.props.store.on("online",function(t){e.setState({online:t})}),this.props.store.on("busy",function(t){e.setState(Object.assign({busy:t},t?{error:""}:{}))}),this.props.store.on("change",function(t){e.props.store.autorefresh=!0,e.setState(t)}),this.props.store.on("error",function(t){e.props.store.autorefresh=!0,e.setState({error:t.message})})}},{key:"addSamples",value:function(){var e=[new h.Routine("Smile",{value:40,unit:"seconds"}),new h.Routine("Stretch neck",{value:2,unit:"hours"}),new h.Routine("Call mum",{value:5,unit:"days"}),new h.Routine("Gym",{value:1,unit:"weeks"}),new h.Routine("Eat cheesecake",{value:3,unit:"weeks"}),new h.Routine("Change bed sheets",{value:15,unit:"days"}),new h.Routine("Periods",{value:28,unit:"days"}),new h.Routine("Water cactus",{value:8,unit:"weeks"}),new h.Routine("Visit dentist",{value:6,unit:"months"}),new h.Routine("Tree blossom",{value:1,unit:"years"})];e.map(this.createRecord.bind(this))}},{key:"editItem",value:function(){this.props.store.autorefresh=!1}},{key:"createRecord",value:function(e){this.props.store.create(e)}},{key:"deleteRecord",value:function(e){this.props.store["delete"](e)}},{key:"updateRecord",value:function(e){this.props.store.update(e)}},{key:"syncRecords",value:function(){this.props.store.sync()}},{key:"render",value:function(){var e=this.state.busy,t=this.state.online,n=e||!t?"disabled":"",i=this.state.online?e?"refresh":"cloud-upload":"alert",o=this.state.online?e?"Syncing...":"Sync":"Offline";return c["default"].createElement("section",null,e?c["default"].createElement("div",{className:"loader"}):"",c["default"].createElement("div",{className:"error"},this.state.error),this.state.items.length>0||e?c["default"].createElement(b,{editItem:this.editItem.bind(this),updateRecord:this.updateRecord.bind(this),deleteRecord:this.deleteRecord.bind(this),items:this.state.items}):c["default"].createElement("div",{className:"samples"},c["default"].createElement("h1",null,"No items found."),c["default"].createElement("button",{className:"btn btn-primary",onClick:this.addSamples.bind(this)},"Add samples")),c["default"].createElement("div",{className:"hbox create"},c["default"].createElement(p,{saveRecord:this.createRecord.bind(this)})),c["default"].createElement("div",{className:"hbox sync"},c["default"].createElement("button",{className:"btn default fit sync","data-icon":"sync",onClick:this.syncRecords.bind(this),disabled:n},c["default"].createElement("span",{className:"glyphicon glyphicon-"+i,"aria-hidden":"true"})," ",o),c["default"].createElement("a",{href:"https://leplatrem.github.io/Routina/#"+this.props.user},c["default"].createElement("span",{className:"glyphicon glyphicon-link","aria-hidden":"true"}),"Permalink")))}}]),t}(c["default"].Component);t["default"]=y},491:function(e,t,n){"use strict";function i(e){return e&&e.__esModule?e:{"default":e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),a=n(403),s=i(a),l=function(){function e(t){var n=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];o(this,e),this.label=t,this.period=n,this.occurences=[]}return r(e,[{key:"serialize",value:function(){var e=Object.assign({},this);return e.occurences=e.occurences.map(function(e){return e.toISOString()}),e}},{key:"check",value:function(){this.occurences.push(new Date)}},{key:"_period",get:function(){return s["default"].duration(this.period.value,this.period.unit)}},{key:"status",get:function(){var t=this._period.as("seconds"),n=.1*t;return this.timeleft<-t?e.status.CRITICAL:this.timeleft<-n?e.status.OVERDUE:this.timeleft<n?e.status.WARNING:e.status.OK}},{key:"elapsed",get:function(){return s["default"]().diff(s["default"](this.last),"seconds")}},{key:"timeleft",get:function(){return s["default"](this.next).diff(s["default"](),"seconds")}},{key:"last",get:function(){return this.occurences[this.occurences.length-1]}},{key:"next",get:function(){return s["default"](this.last).add(this._period).toDate()}}],[{key:"deserialize",value:function(t){var n=new e;return Object.assign(n,t),n.occurences=n.occurences.map(function(e){return new Date(e)}),n}},{key:"status",get:function(){return{OK:"ok",WARNING:"warning",OVERDUE:"overdue",CRITICAL:"critical"}}},{key:"units",get:function(){return["seconds","minutes","hours","days","weeks","months","years"]}}]),e}();t.Routine=l},492:function(e,t,n){"use strict";function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}Object.defineProperty(t,"__esModule",{value:!0});var r=function(){function e(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}}(),a=function(e,t,n){for(var i=!0;i;){var o=e,r=t,a=n;s=u=l=void 0,i=!1,null===o&&(o=Function.prototype);var s=Object.getOwnPropertyDescriptor(o,r);if(void 0!==s){if("value"in s)return s.value;var l=s.get;return void 0===l?void 0:l.call(a)}var u=Object.getPrototypeOf(o);if(null===u)return void 0;e=u,t=r,n=a,i=!0}},s=n(493),l=n(491),u=function(e){function t(e,n){i(this,t),a(Object.getPrototypeOf(t.prototype),"constructor",this).call(this),this.state={items:[],online:!0,busy:!1},this.collection=e.collection(n)}return o(t,e),r(t,[{key:"deserialize",value:function(e){return l.Routine.deserialize(e)}},{key:"serialize",value:function(e){return e.serialize()}},{key:"onError",value:function(e){this.busy=!1,this.emit("error",e)}},{key:"emitChange",value:function(){var e=arguments.length<=0||void 0===arguments[0]?{autosync:!1}:arguments[0];this.state.items.sort(function(e,t){return e.timeleft-t.timeleft});this.emit("change",this.state),e.autosync&&this.autorefresh&&this.sync()}},{key:"load",value:function(){var e=this;return this.collection.list().then(function(t){var n=t.data.map(e.deserialize);e.state.items=n,e.emitChange()})["catch"](this.onError.bind(this))}},{key:"create",value:function(e){var t=this;return this.collection.create(this.serialize(e)).then(function(e){var n=t.deserialize(e.data);t.state.items.push(n),t.emitChange({autosync:!0})})["catch"](this.onError.bind(this))}},{key:"update",value:function(e){var t=this;return this.collection.update(this.serialize(e)).then(function(n){t.state.items=t.state.items.map(function(i){var o=t.deserialize(n.data);return i.id===e.id?o:i}),t.emitChange({autosync:!0})})["catch"](this.onError.bind(this))}},{key:"delete",value:function(e){var t=this;return this.collection["delete"](e.id).then(function(n){t.state.items=t.state.items.filter(function(t){return t.id!==e.id}),t.emitChange({autosync:!0})})["catch"](this.onError.bind(this))}},{key:"sync",value:function(){var e=this;if(this.state.online&&!this.state.busy)return this.busy=!0,this.collection.sync().then(function(t){return e.busy=!1,t.ok?e.load():Promise.all(t.conflicts.map(function(t){return e.collection.resolve(t,t.remote)})).then(function(t){return e.sync()})})["catch"](this.onError.bind(this))}},{key:"online",set:function(e){var t=this.state.online!==e;this.state.online=e,t&&this.emit("online",e),t&&e&&this.autorefresh&&this.sync()},get:function(){return this.state.online}},{key:"busy",set:function(e){var t=this.state.busy!==e;this.state.busy=e,t&&this.emit("busy",e)},get:function(){return this.state.busy}},{key:"autorefresh",set:function(e){e?this._timer||(this._timer=setInterval(this.emitChange.bind(this),5e3)):this._timer&&(this._timer=clearInterval(this._timer))},get:function(){return!!this._timer}}]),t}(s.EventEmitter);t.Store=u},565:function(e,t,n){var i=n(566);"string"==typeof i&&(i=[[e.id,i,""]]);n(564)(i,{});i.locals&&(e.exports=i.locals)},566:function(e,t,n){t=e.exports=n(558)(),t.push([e.id,"@font-face{font-family:Fira Sans;src:url("+n(567)+");src:local('Fira Sans Regular'),url("+n(568)+") format('woff'),url("+n(569)+") format('woff2');font-weight:400;font-style:normal}@font-face{font-family:Fira Sans;src:url("+n(570)+");src:local('Fira Sans Bold'),url("+n(571)+") format('woff'),url("+n(572)+') format(\'woff2\');font-weight:700;font-style:normal}.loader{height:4px;width:100%;left:0;top:0;position:fixed;overflow:hidden;background-color:#ddd;z-index:999}.loader:before{display:block;position:absolute;content:"";left:-200px;width:200px;height:4px;background-color:#2980b9;animation:loading 2s linear infinite}@keyframes loading{0%{left:-200px}0%,50%{width:30%}70%{width:70%}80%{left:50%}95%{left:120%}to{left:100%}}.nopad{padding-left:0;padding-right:0}.hbox{display:flex;flex-direction:row;justify-content:space-between;align-items:center}.hbox>*,.hbox>:first-child{margin-left:4px}.hbox>:last-child{margin-right:4px}.fit{flex-grow:1}.pull-end{margin-left:auto}body,html{width:100%;padding:0;margin-bottom:4px;font-family:Fira Sans}.btn.default{background-color:transparent;border-color:#ddd}.error{color:red}li.hbox{align-items:stretch}li.ok button.check{box-shadow:inset 4px 0 0 0 green;background-color:rgba(0,128,0,.2);color:green}li.warning button.check{box-shadow:inset 4px 0 0 0 #ffd800;background-color:rgba(255,216,0,.2);color:#ffd800}li.overdue button.check{box-shadow:inset 4px 0 0 0 #ff7e00;background-color:rgba(255,126,0,.2);color:#ff7e00}li.critical button.check{box-shadow:inset 4px 0 0 0 #d70000;background-color:rgba(215,0,0,.2);color:#d70000}li .routine{font-size:1.2em;font-weight:700}li .next{color:#888;padding-left:2px;display:block}li .details{align-self:center}li .details>span{display:block;width:100%;text-align:center}li .details .last{color:#888}li .details .last:before{content:"("}li .details .last:after{content:")"}li .details .period .unit:before,li .details .period .value:before{content:"\\A0"}.samples{text-align:center;margin-bottom:1em}.samples h1{color:#ddd}.create{margin-bottom:20px;padding-left:4px;padding-right:4px}.create form{padding:4px 0;border-radius:4px;border:1px solid #ddd}form.hbox,form.hbox:last-child{margin:0}form .form-control{margin-left:4px;padding:6px 3px}form input[name=label]{min-width:0;display:inline}form input[name=value]{max-width:4em}form button[type=submit]{margin-left:4px}',""])},567:function(e,t,n){e.exports=n.p+"24072a8021ae9031e702cc98d0b970ef.eot"},568:function(e,t,n){e.exports=n.p+"ba1f3bb83d99f39922a59d9fc74f5997.woff"},569:function(e,t,n){e.exports=n.p+"0ed10407356f296980956152c097d932.woff2"},570:function(e,t,n){e.exports=n.p+"fddeb422f43b78c998446318024f9e48.eot"},571:function(e,t,n){e.exports=n.p+"6098762daee4e4f41d01d53e4f88bcfc.woff"},572:function(e,t,n){e.exports=n.p+"299cd657b16b0d7f9cb1cd890e935a9d.woff2"}});