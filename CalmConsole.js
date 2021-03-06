/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */

var CalmConsole = function(options){
	'use strict';

	var CalmObj = this,
		ActionList = {},
		DefaultStates = {},
		options = options || {},
		RenderedObj = null,
		Toggle = null,
		Close = null,
		DB = {},
		__actions = [];
		

/*
 * ---------------------------------------------------------------------------------
 * Publicly accessible methods
 * ---------------------------------------------------------------------------------
 */
	/*
	 * Constructor
	 */
	this.__init__ = function(){
		options = {
			useLocalStorage: options.useLocalStorage && localStorage || false,
			position: options.position || 'bottom',
			max_string_length: options.max_string_length || 80,
		};

		//create cookies or store initial data to localstorage db
		_setDefaultApplicationState();
		//create the UI
		_loadUI();
		//set listeners on objects that require interaction
		_loadListeners();
		//change state of the application
		_setState('app', 'ready');

		return CalmObj;
	};

	/*
	 * public function log()
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.log = function(toLog){
		return _logAction(toLog);
	};

	/*
	 * public function warn()
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.warn = function(toLog){
		return _logAction(toLog, 'msg-warning');
	};

	/*
	 * public function error()
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.error = function(toLog){
		return _logAction(toLog, 'msg-error');
	};

	/*
	 * public function success() - For messages that indicate a successful transaction
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.success = function(toLog){
		return _logAction(toLog, 'msg-success');
	}

	/*
	 * public function special() - For messages that are special 
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.special = function(toLog){
		return _logAction(toLog, 'msg-special');
	};

	/*
	 * public function custom() - User defined styling options
	 *
	 * @param toLog [string|object] the item you want to log
	 * @param options [object] styling options for the message
	 *
	 * options.prototype = {
	 * 		
	 * }
	 */
	this.custom = function(toLog, options){
		return _logAction(toLog, 'msg-custom', options);
	};

	/*
	 * public function setOption() - may be removed
	 *
	 * @param property [string] the property you want to change
	 * @param value [string] the new value of the property
	 */
	/*this.setOption = function(property, value){
		options[property] = value;
		//update UI here
		//_resetApplication(options);

		return 'OPTION SET: options.'+ property +' = '+options[property];
	};*/

	/*
	 * public function getOption()
	 *
	 * @param toLog [property] the option you wish to retreive
	 */
	this.getOption = function(property){
		var ret = false;

		if(options[property]){
			ret = options[property];
		}

		return ret;
	};

	/*
	 * public function .getOptions()
	 * 
	 * Get all options
	 */
	this.getOptions = function(){
		return options;
	};

	/*
	 * public function reset() - Clears console and resets to the default state
	 *
	 * @param options [object] defaults for the new console
	 */
	this.reset = function(){
		_resetApplicationState();

		ActionList.innerHTML = '';
		
		RenderedObj.classList.remove('hidden');

		return true;
	};

	this.getState = function(state){
		return _getState(state)[0];
	};

/*
 * ---------------------------------------------------------------------------------
 *  Private methods
 * ---------------------------------------------------------------------------------
 */
	/*
	 * private function _loadUI() - Build the HTML elements required for the UI
	 */
	function _loadUI(){
		//Create the console
		var consoleElement = document.createElement('div');
			consoleElement.classList.add('CalmConsole');
			consoleElement.classList.add('page-'+options.position);

		//Create the minimize/maximize toggle element
		var toggleElement = document.createElement('a');
			toggleElement.classList.add('toggle');
			toggleElement.innerHTML = '&#x25BC;';
			toggleElement.href = '#';

		//Create the close console element
		var closeElement = document.createElement('a');
			closeElement.classList.add('close');
			closeElement.innerHTML = '&times;';
			closeElement.href = '#';

		//Create the console header element
		var headerElement = document.createElement('header');
			headerElement.classList.add('header');
			headerElement.innerHTML = '<h2>CalmConsole</h2>';

		//Create the wrapper for the minimize/close controls
		var controlElement = document.createElement('div');
			controlElement.classList.add('controls');

		//Create the console log list element
		var listElement = document.createElement('ul');
			listElement.classList.add('msg-list');

		Close = closeElement;
		ActionList = listElement;
		RenderedObj = consoleElement;
		Toggle = toggleElement;

		//add CalmConsole to the DOM
		document.body.appendChild(RenderedObj);

		//add the various UI elements too
		headerElement.appendChild(controlElement);
		controlElement.appendChild(toggleElement);
		controlElement.appendChild(closeElement);
		RenderedObj.appendChild(headerElement);
		RenderedObj.appendChild(ActionList);

		//style everything
		_loadStyles();
	};

	/*
	 * @param toLog [string]
	 * @param classes [string|array]
	 */
	function _outputString(toLog, classes, opts){
		var htmlObj = document.createElement('li');
			htmlObj.innerHTML = toLog;
			classes = (!classes ? 'msg-log' : classes);

			//merge opts with htmlObj here

		htmlObj.classList.add(classes);
		
		return htmlObj;
	};

	function _outputObject(toLog, classes, opts){
		if(toLog){
			var outputObj = document.createElement('li'), clone = Object.create(toLog);
				outputObj.classList.add(classes);
				outputObj.classList.add('msg-output-object');
			var outputStr = '',
				currObjName = _getObjectName(clone),
				action_toggle = document.createElement('span');
				action_toggle.classList.add('action');
				action_toggle.innerHTML = '&#x25B6; '+ currObjName;

				//merge opts with outputObj here

				for(var prop in clone){
					if(clone[prop] && typeof clone[prop] != 'function'){
						if(typeof clone[prop] == 'object'){
							//outputStr += '<p class="t1">I IS OBJECT LOL</p>';
						}else {
							outputStr += '<p class="t1">'+ prop + ' '+ Util.String._(clone[prop], options, true)+'</p>';
						}
					}
				}

			outputObj.appendChild(action_toggle);
			outputObj.innerHTML += outputStr;

			//TODO: move to some sort of "onRenderComplete" callback here
			outputObj.addEventListener('click', function(evt){
				evt.preventDefault();

				if(this.classList.contains('expanded')){
					this.querySelector('.action').innerHTML = '&#x25B6; '+ currObjName;
					this.classList.remove('expanded');
				}else {
					this.querySelector('.action').innerHTML = '&#x25BC; '+ currObjName;
					this.classList.add('expanded');
				}
			});

			return outputObj;
		}
		
		CalmObj.error('Error: DOM Element Not Found');
	};

	//move to Util.something
	function _getObjectName(obj){
		if(obj.constructor.name){
			return '[object '+ obj.constructor.name +']';
		}else {
			if(obj.constructor.toString().indexOf('[') === 0){ //on iPad, obj.constructor.toString = [object OBJECT_TYPE], display something different for that case
				return obj.constructor.toString(); //not what I want to use here but oh well
			}
		}
	};

	function _logAction(toLog, classes, options){
		if(typeof toLog == 'string'){
			ActionList.appendChild(_outputString(toLog, classes, options));
		}else {
			ActionList.appendChild(_outputObject(toLog, classes, options));
		}

		//__actions.push(_outputString(toLog, classes));
		//serialize output here, set CalmConsole.data to the result
		//var x = JSON.stringify({'message': toLog, 'classes': classes});
		//console.log(JSON.stringify({'message': toLog, 'classes': classes}));
		_store('data', {'message': toLog, 'classes': classes});

		return null;
	};

	function _loadStyles(){
		var stylesheet = document.createElement('style');
			stylesheet.innerText = '.CalmConsole ::selection {background: transparent;} .CalmConsole {position: fixed; width: 100%; height: 300px; font-size: 1em; color: black; overflow-y: auto; background: white; border-top: 1px solid rgba(0,0,0,0.3); font-family: "Lucida Sans Unicode", sans-serif;} .CalmConsole.page-bottom {bottom: 0px;} .CalmConsole.page-top {top: 0px;} .CalmConsole li {padding: 3px; margin: 0px; border-bottom: 1px solid rgba(0,0,0,0.3);} .CalmConsole li:hover {} .CalmConsole li.msg-output-object {height: 17px; overflow: hidden; cursor: pointer;} .CalmConsole li.expanded {height: auto;} .CalmConsole .controls {height: 40px; position: absolute; right: 10px; top: -10%;} .CalmConsole.minimized {height: 41px; overflow: hidden; border-bottom: 0px;} .CalmConsole .msg-warning {background-color: #FCF8E3;} .CalmConsole .msg-special {background-color: #D9EDF7;} .CalmConsole .msg-error {background-color: #F2DEDE;} .CalmConsole .msg-success {background-color: #DFF0D8;} .CalmConsole ul {padding: 0px; margin: 0px;} .CalmConsole header {position: relative; font-family: Helvetica, Arial, sans-serif; border-bottom: 1px solid rgba(0,0,0,0.3); background-image: -ms-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -moz-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -o-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #FFFFFF), color-stop(1, #EEEEEE)); background-image: -webkit-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: linear-gradient(to bottom, #FFFFFF 0%, #EEEEEE 100%);} .CalmConsole header h2 {font-size: 1.5em; float: left; margin: 10px;} .CalmConsole header, .CalmConsole ul.msg-list {float: left; width: 100%; font-size: 11px;} .CalmConsole .controls a {position: relative; color: black; font-size: 4em; float: left; margin-left: 0.2em; text-decoration: none; opacity: 0.4; text-shadow: 1px 1px 1px #ddd;} .CalmConsole .controls a:hover {color: #E2237D; opacity: 1;} .CalmConsole.hidden {display: none;} .CalmConsole.page-top {border-top: 1px solid rgba(0,0,0,0.3);} .CalmConsole .controls .toggle {font-size: 2.7em; top: 7px;} .CalmConsole p {padding: 0px; margin: 0px;} .CalmConsole .t1 {margin: 0px 12px; border-bottom: 1px solid rgba(0,0,0,0.1); padding: 3px 0px;}';

		return document.head.appendChild(stylesheet);
	};

	function _setDefaultApplicationState(){
		//setup default states
		DefaultStates = {
			'toggle': 0, //0 = show, 1 = hide
			'close': 1, //0 = hide, 1 = show
			'appstate': 'initial', //initial, busy, ready
			'datalist': "",
		};

		//DB.connect();
		//instantiate the database object
		window.DBO = new DB();

		//default to initial every time
		_setState('app', DefaultStates.appstate);

		if(!_query('toggle')) _store('toggle', DefaultStates.toggle);
		if(!_query('data')) _store('data', DefaultStates.datalist);
		if(!_query('close')) _store('close', DefaultStates.close);

		return true;
	};

	function _resetApplicationState(){
		//empty localstorage
		if(localStorage) localStorage.clear();

		_store('toggle', DefaultStates.toggle, 'Thu, 01 Jan 1970 00:00:01 GMT');
		//_store('data', DefaultStates.datalist, 'Thu, 01 Jan 1970 00:00:01 GMT');
		_store('close', DefaultStates.close, 'Thu, 01 Jan 1970 00:00:01 GMT');
		_store('State.app', DefaultStates.appstate, 'Thu, 01 Jan 1970 00:00:01 GMT');
	
		return true;
	};

	function _setState(state, str){
		return _store('State.'+ state, str);
	};

	function _getState(state){
		var output = [],
			query_result = _query('State.'+ state);
			state = state.toLowerCase();

		output.push(query_result);

		if(query_result){
			output.push('State found');
		}else {
			output.push('State ('+ state +') not found.');
		}

		return output;		
	};

	function _query(item){
		if(!options.useLocalStorage){
			return _getCookie('CalmConsole.'+ item);
		}else {
			return localStorage.getItem('CalmConsole.'+ item);
		}
	}

	/**
	 * [_store description]
	 * TODO: implement indexedDb instead of localstorage
	 * @param  {[type]} item   [description]
	 * @param  {[type]} data   [description]
	 * @param  {[type]} expiry [description]
	 * @return {[type]}        [description]
	 */
	function _store(item, data, expiry){
		//var req = _getDatabase(); //do _getDatabase on app load
		console.log(DB);
		
	}

	function _getDatabase(){
		var db = null;

		if(window.indexedDB){
			var request = indexedDB.open("CalmConsole", 1); 

			request.onupgradeneeded = function(evt){
				console.log("UPGRADING CALMCONSOLE DATABASE");
			}

			request.onsuccess = function(evt){
				db = evt.target.result;
			}

			request.onerror = function(evt){
				console.dir(evt);
			}
		}

		return db;
	}

	function _store2(item, data, expiry){
		if(!item) return false;

		var currentQueue = _getCurrentQueue();
		//console.log(currentQueue);
			//currentQueue.push(JSON.stringify(data));

		if(item !== "data"){
			currentQueue = JSON.stringify(data);
		}

		if(!options.useLocalStorage){
			return _setCookie('CalmConsole.'+ item, currentQueue, expiry);
		}else {
			return localStorage.setItem('CalmConsole.'+ item, currentQueue);
		}
	}

	function _getCurrentQueue(){
		var queue = [];

		if(options.useLocalStorage && localStorage.getItem('CalmConsole.data') && localStorage.getItem('CalmConsole.data').length > 3){
			queue.push(localStorage.getItem('CalmConsole.data'));
		}

		return queue;
	}

	function _loadListeners(){
		if(_query('toggle') == 0){
			RenderedObj.classList.remove('minimized');
			Toggle.innerHTML = '&#x25BC;';
		}else {
			RenderedObj.classList.add('minimized');
			Toggle.innerHTML = '&#x25B2;';
		}

		if(_query('close') == 0){
			RenderedObj.classList.add('hidden');
		}

		Toggle.addEventListener('click', function(evt){
			evt.preventDefault();

			if(RenderedObj.classList.contains('minimized')){
				RenderedObj.classList.remove('minimized');
				Toggle.innerHTML = '&#x25BC;';

				_store('toggle', 0);
			}else {
				RenderedObj.classList.add('minimized');
				Toggle.innerHTML = '&#x25B2;';

				_store('toggle', 1);
			}
		});

		Close.addEventListener('click', function(evt){
			evt.preventDefault();

			RenderedObj.classList.add('hidden');
			
			_store('close', 0);
		});
	};

	function _setCookie(name, value, expiry){
		var date = new Date();
			expiry = (expiry ? expiry : 7);
		date.setDate(date.getDate() + expiry);

		var value = escape(value) + "; expires=" + date.toUTCString();

		document.cookie = name + "=" + value;
	};

	function _getCookie(name){
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	};

/*
 * ---------------------------------------------------------------------------------
 * Database object
 * 
 * Manages connections to the indexedDB-based database, localStorage as a
 * fallback.
 * ---------------------------------------------------------------------------------
 */

 	var DB = function(){ //must make this a function, not an object
 		this.instance = null;
 		this.product = "CalmConsole";

 		this.connect = function(){
 			if(window.indexedDB){
	 			var version = 4,
	 				_DBO = this,
	 				request = indexedDB.open(this.product, version);

	 			request.onupgradeneeded = function(evt){
	 				var db = evt.target.result;

	 				evt.target.onerror = _DBO.error;

	 				if(db.objectStoreNames.contains(_DBO.product)){
	 					db.deleteObjectStore(_DBO.product);
	 				}

	 				var store = db.createObjectStore(_DBO.product, {keyPath: "time"});
	 			};

	 			request.onsuccess = function(evt){
	 				_DBO.instance = evt.target.result;
	 				//do getAllItems or something here
	 				_DBO.get("item", 3);
	 			};

	 			request.onerror = _DBO.error;
	 		}else {
	 			this.instance = window.localStorage;
	 		}

	 		return this.instance;
 		};

 		this.error = function(evt){
 			return CalmObj.error("["+ evt.target.error.name + "] "+ evt.target.error.message);
 		};

 		this.query = function(id){
 			if(isNaN(id)){
 				return CalmObj.error("Could not retrieve data for item #"+ id);
 			}
 			//console.log(this.instance);
 			var transaction = this.instance.transaction([this.product], "readwrite"),
 			 	store = transaction.objectStore(this.product),
 			 	keyRange = IDBKeyRange.only(id);

 			 console.log(keyRange);


 			//store.autoIncrememnt = true;

 			//console.log(store);
 		};

 		this.get = function(type, id){
 			switch(type){
 				case "all":
 					this.query("HAHA");
 					break;

 				default:
 				case "item":
 					this.query(id);
 			}
 		};

 		this.add = function(text){

 		};
 		
 		return this.connect();
 	};

 	/*var DB = { //must make this a function, not an object
 		instance: null,

 		connect: function(){
 			if(window.indexedDB){
	 			var version = 1,
	 				product = "CalmConsole",
	 				request = indexedDB.open(product, version);

	 			request.onupgradeneeded = function(evt){
	 				var db = evt.target.result;

	 				evt.target.onerror = DB.error;

	 				if(db.objectStoreNames.contains(product)){
	 					db.deleteObjectStore(product);
	 				}

	 				var store = db.createObjectStore(product, {keyPath: "time"});
	 			}

	 			request.onsuccess = function(evt){
	 				DB.instance = evt.target.result;
	 				
	 				//do getAllItems or something here
	 				DB.get("f");

	 			}

	 			

	 			request.onerror = DB.error;
	 		}else {
	 			this.instance = window.localStorage;
	 		}

	 		return false;
 		},

 		error: function(arg){
 			console.error(arg);
 		},

 		close: function(){},

 		query: function(query){
 			var db = this.instance;

 			if(query === undefined){
 				query = ""; //get all items
 			}
 			console.log(query);
 		},

 		get: function(arg){
 			switch(arg){
 				case "all":
 					this.query("HAHA");
 					break;

 				default:
 					this.query();
 			}
 		},

 		add: function(text){

 		},

 	};*/

/*
 * ---------------------------------------------------------------------------------
 * Utilities
 *
 * String/object manipulation library
 * ---------------------------------------------------------------------------------
 */

	var Util = {
		//TODO: add options to each element (currently ignored)
		Element: {
			_elements: [],
			renderContext: {},

			/*
			 * Creates a div element
			 *
			 * @param options [type: object] the initial settings for the new object
			 */
			div: function(options){
				var el = document.createElement('div');

				this._elements.push(el);

				return el;
			},

			/*
			 * Creates a paragraph element
			 *
			 * @param options [type: object] the initial settings for the new object
			 */
			p: function(options){
				var el = document.createElement('p');

				this._elements.push(el);

				return el;
			},

			/*
			 * Creates a span element
			 *
			 * @param options [type: object] the initial settings for the new object
			 */
			span: function(options){
				var el = document.createElement('span');

				this._elements.push(el);

				return el;
			},

			/*
			 * Creates a button element
			 *
			 * @param options [type: object] the initial settings for the new object
			 */
			button: function(options){
				var el = document.createElement('button');

				this._elements.push(el);

				return el;
			},

			/*
			 * Empties the element array
			 *
			 * @param options [type: object] the initial settings for the new object
			 */
			empty: function(){
				this._elements = [];
			},

			/*
			 * Renders any elements added to the elements array
			 *
			 * @param options [type: object] the initial settings for the new object
			 */
			render: function(){
				for(var i = 0; i < this._elements.length; i++){
					this.renderContext.appendChild(this._elements[i]);
				}
			},
		},

		String: {
			//move string formatting out of this function
			truncate: function(str, options){
				var ret = {
						type: typeof str,
						output: [],
					};

				if(ret.type == 'string'){
					var processed_str = str.substring(0, options.max_string_length).split(" ").slice(0, -1);

					if(processed_str.length > 0){
						ret.output = this.stripHTML(processed_str.join(" "));
					}else {
						ret.output = this.stripHTML(str);
					}
				}else {
					ret.output = this.stripHTML(str);
				}

				return ret;
			},

			stripHTML: function(str){
				var tmp = document.createElement("div");

				tmp.innerHTML = str;

				return tmp.textContent || tmp.innerText;
			},

			formatInspectorOutput: function(arr){
				var output = null;

				if(arr[1] == 'string'){
					if(arr[0].length > 0){
						output = '['+ arr[1] +']: <strong>' + arr[0] + "...</strong>";
					}else {
						output = '['+ arr[1] +']: <strong>' + arr[0] +'</strong>';
					}
				}else {
					output = '['+ arr[1] +']: <strong>' + arr[0] + '</strong>';
				}

				return output;
			},

			/*
			 * Prints a truncated string, can be formatted using String.formatInspectorOutput
			 */
			_: function(str, options, format_output){
				if(format_output){
					return this.formatInspectorOutput(this.truncate(str, options));
				}else {
					return this.truncate(str, options);
				}
			},
		},
	}

/*
 * ---------------------------------------------------------------------------------
 *   Overwrite console.[method] for browsers that support it
 * ---------------------------------------------------------------------------------
 */
	if(window.console){
		//console.log = function(toLog){return _logAction(toLog);}; //commented out for development
		console.warn = function(toLog){return _logAction(toLog, 'msg-warning');};
		console.error = function(toLog){return _logAction(toLog, 'msg-error');};
	}

/*
 * ---------------------------------------------------------------------------------
 *  Call the constructor
 * ---------------------------------------------------------------------------------
 */
	return this.__init__();
};

var calm = new CalmConsole({
	useLocalStorage: true,
	max_string_length: 20,
});


