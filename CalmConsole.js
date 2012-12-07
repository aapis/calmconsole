/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */

//TODO:
//- push all logged messages to __actions (or something) and parse/display later to cut down on calls to .appendChild()
//- add support for attachEvent in case mobile IE still doesn't support addEventListener
//- add confirm functionality to close button, possibly in form of "command line" (which still needs to be written)?
//- command line functionality
var CalmConsole = function(options){
	'use strict';

	var CalmObj = this,
		ActionList = {},
		DefaultStates = {},
		options = options || {},
		RenderedObj = null,
		Toggle = null,
		Close = null,
		Loaded = false,
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
			useLocalStorage: options.useLocalStorage && localStorage || true,
			position: options.position || 'bottom',
			max_string_length: options.position || 20,
		};
		
		//create cookies or store initial data to localstorage db
		_setApplicationState();
		//create the UI
		_loadUI();
		//set listeners on objects that require interaction
		_loadListeners();

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
	}

	/*
	 * public function clear() - Empty the console
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.clear = function(){
		ActionList.innerHTML = '';
	};

	/*
	 * public function setOption() - may be removed
	 *
	 * @param property [string] the property you want to change
	 * @param value [string] the new value of the property
	 */
	this.setOption = function(property, value){
		options[property] = value;
		//update UI here
		//_resetApplication(options);

		return 'OPTION SET: options.'+ property +' = '+options[property];
	};

	/*
	 * public function getOption()
	 *
	 * @param toLog [property] the option you wish to retreive
	 */
	this.getOption = function(property){
		return options[property];
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
		
		RenderedObj.classList.remove('hidden');
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

		//set utility context
		Util.Element.renderContext = RenderedObj;
		Util.Element.render();
		//style everything
		_loadStyles();
	};

	/*
	 * @param toLog [string]
	 * @param classes [string|array]
	 */
	function _outputString(toLog, classes){
		var htmlObj = document.createElement('li');
			htmlObj.innerHTML = toLog;
			classes = (!classes ? 'msg-log' : classes);

		htmlObj.classList.add(classes);
		
		return htmlObj;
	};

	function _outputObject(toLog, classes){
		if(toLog){
			var outputObj = document.createElement('li'), clone = Object.create(toLog);
				outputObj.classList.add(classes);
				outputObj.classList.add('msg-output-object');
			var currObjName = (clone.constructor.name ? clone.constructor.name : clone.constructor.toString()),
				outputStr = '';



			//current object
				outputStr += '<span class="t1">'+ currObjName +' {';
					for(var prop in clone){
						//console.log('clone.'+ prop +' = '+ clone[prop]);
						if(clone[prop] && typeof clone[prop] != 'function'){
							outputStr += '<p class="t2">'+ prop + ' '+ Util.String.truncate(clone[prop], options)+'</p>';
						}
					}
				outputStr += '}</span>';
			outputStr += '</p>';
			
			outputObj.innerHTML = outputStr;

			//children
			/*if(clone.children.length > 0){
				outputObj.innerHTML += '<p><em>Children: <strong>'+ clone.children.length +'</strong></em><span class="t1">';

				for(var i = 0; i < clone.children.length; i++){
					var childObjName = (clone.children[i].constructor.name ? clone.children[i].constructor.name : clone.children[i].constructor.toString());

						outputObj.innerHTML += '<span class="t2">'+ (i+1) + '. '+  childObjName +' {';
							if(clone.children[i].classList.length > 0)
								outputObj.innerHTML += '<span>classList: <strong>'+ clone.children[i].classList +'</strong>; </span>';
							if(clone.children[i].id)
								outputObj.innerHTML += '<span>id: <strong>'+ clone.children[i].id +'</strong>; </span>';
							if(clone.children[i].offsetWidth > 0)
								outputObj.innerHTML += '<span>width: <strong>'+ clone.children[i].offsetWidth +'px</strong>; </span>';
							if(clone.children[i].offsetHeight > 0)
								outputObj.innerHTML += '<span>width: <strong>'+ clone.children[i].offsetHeight +'px</strong>; </span>';
						outputObj.innerHTML += '}</span>';
				}
					outputObj.innerHTML += '</span>';
				outputObj.innerHTML += '</p>';
			}*/

	
			//attach a listener so we can shrink/expand each object
			outputObj.addEventListener('click', function(evt){
				evt.preventDefault();

				if(this.classList.contains('msg-output-object-expanded')){
					this.classList.remove('msg-output-object-expanded');
				}else {
					this.classList.add('msg-output-object-expanded');
				}
			});

			return outputObj;
		}
		
		CalmObj.error('Error: DOM Element Not Found');
	};

	function _logAction(toLog, classes){
		if(!Loaded) return;

		if(typeof toLog == 'string'){
			ActionList.appendChild(_outputString(toLog, classes));
		}else {
			ActionList.appendChild(_outputObject(toLog, classes));
		}

		//__actions.push(_outputString(toLog, classes));
		//console.log(__actions);

		return null;
	};

	function _loadStyles(){
		var stylesheet = document.createElement('style');
			stylesheet.innerHTML = '.CalmConsole ::selection {background: transparent;} .CalmConsole {position: fixed; '+ options.position +': 0px; width: 100%; height: 300px; font-size: 1em; color: black; overflow-y: auto; background: white; border-top: 1px solid rgba(0,0,0,0.3); font-family: "Lucida Sans Unicode";} .CalmConsole li {padding: 3px; margin: 0px; border-bottom: 1px solid rgba(0,0,0,0.3);} .CalmConsole li:hover {} .CalmConsole li.msg-output-object {height: 30px; overflow: hidden; cursor: pointer;} .CalmConsole li.msg-output-object-expanded {height: auto;} .CalmConsole .controls {position: absolute; right: 10px; top: -10%;} .CalmConsole.minimized {height: 41px; overflow: hidden; border-bottom: 0px;} .CalmConsole .msg-warning {background-color: #FCF8E3;} .CalmConsole .msg-special {background-color: #D9EDF7;} .CalmConsole .msg-error {background-color: #F2DEDE;} .CalmConsole .msg-success {background-color: #DFF0D8;} .CalmConsole ul {padding: 0px; margin: 0px;} .CalmConsole header {position: relative; font-family: Helvetica, Arial, sans-serif; border-bottom: 1px solid rgba(0,0,0,0.3); background-image: -ms-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -moz-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -o-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #FFFFFF), color-stop(1, #EEEEEE)); background-image: -webkit-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: linear-gradient(to bottom, #FFFFFF 0%, #EEEEEE 100%);} .CalmConsole header h2 {font-size: 1.5em; float: left; margin: 10px;} .CalmConsole header, .CalmConsole ul.msg-list {float: left; width: 100%; font-size: 11px;} .CalmConsole .controls a {color: black; font-size: 3.5em; margin-left: 0.5em; text-decoration: none; opacity: 0.4; text-shadow: 1px 1px 1px #ddd;} .CalmConsole .controls a:hover {color: #E2237D; opacity: 1;} .CalmConsole.hidden {display: none;} .CalmConsole.page-top {border-top: 1px solid rgba(0,0,0,0.3);} .CalmConsole .controls .toggle {font-size: 2.4em;} .CalmConsole p {padding: 0px; margin: 0px;} .CalmConsole .t1 {margin-left: 6px;} .CalmConsole .t2 {margin: 0px 12px; border-bottom: 1px solid rgba(0,0,0,0.1); padding: 3px 0px;}';

		Loaded = true;

		return document.head.appendChild(stylesheet);
	};

	function _setApplicationState(){
		//setup default states
		DefaultStates = {
			'toggle': 0, //0 = show, 1 = hide
			'close': 1, //0 = hide, 1 = show
		};

		if(!_query('toggle')) _store('toggle', DefaultStates.toggle);
		if(!_query('close')) _store('close', DefaultStates.close);

		return true;
	};

	function _resetApplicationState(){
		_store('toggle', DefaultStates.toggle, 'Thu, 01 Jan 1970 00:00:01 GMT');
		_store('close', DefaultStates.close, 'Thu, 01 Jan 1970 00:00:01 GMT');
	
		return true;
	};

	function _query(item){
		if(!options.useLocalStorage){
			return _getCookie('CalmConsole.'+ item);
		}else {
			return localStorage.getItem('CalmConsole.'+ item);
		}
	}

	function _store(item, data, expiry){
		if(!options.useLocalStorage){
			return _setCookie('CalmConsole.'+ item, data);
		}else {
			return localStorage.setItem('CalmConsole.'+ item, data);
		}
	}

	function _loadListeners(){
		if(!Loaded) return;

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
	}

/*
 * ---------------------------------------------------------------------------------
 * Utilities
 * ---------------------------------------------------------------------------------
 */

	var Util = {
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
			truncate: function(str, options){
				var type = typeof str,
					output = null;

				if(type == 'string'){
					var processed_str = str.substring(0, options.max_string_length).split(" ").slice(0, -1);

					if(processed_str.length > 0){
						output = '['+ type +']: <strong>' + this.stripHTML(processed_str.join(" ")) + "...</strong>";
					}else {
						output = '['+ type +']: <strong>' + str +'</strong>';
					}
				}else {
					output = '['+ type +']: <strong>' + str + '</strong>';
				}

				return output;
			},

			stripHTML: function(str){
				var tmp = document.createElement("div");

				tmp.innerHTML = str;

				return tmp.textContent||tmp.innerText;
			},
		},
	}

/*
 * ---------------------------------------------------------------------------------
 *  Overwrite console.[method]
 * ---------------------------------------------------------------------------------
 */
	//console.log = function(toLog){return _logAction(toLog);};
	console.warn = function(toLog){return _logAction(toLog, 'msg-warning');};
	console.error = function(toLog){return _logAction(toLog, 'msg-error');};

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


