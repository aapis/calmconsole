/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */

//TODO:
//- push all logged messages to __actions (or something) and parse/display later to cut down on calls to .appendChild()
//- add documentation
//- BUG: cannot log anything after the console has been closed and reset (adds a new console on top of old one)
//- add support for attachEvent in case mobile IE still doesn't support addEventListener
//- add confirm functionality to close button, possibly in form of "command line" (which still needs to be written)?
var CalmConsole = function(options){
	'use strict';

	var CalmObj = this,
		RenderedObj = null,
		ActionList = {},
		Toggle = null,
		Close = null,
		__actions = [],
		options = options || {},
		Loaded = false;

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
	 * .log()
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.log = function(toLog){
		return _logAction(toLog);
	};

	/*
	 * .warn()
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.warn = function(toLog){
		return _logAction(toLog, 'msg-warning');
	};

	/*
	 * .error()
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.error = function(toLog){
		return _logAction(toLog, 'msg-error');
	};

	/*
	 * .success() - For messages that indicate a successful transaction
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.success = function(toLog){
		return _logAction(toLog, 'msg-success');
	}

	/*
	 * .special() - For messages that are special 
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.special = function(toLog){
		return _logAction(toLog, 'msg-special');
	}

	/*
	 * .clear() - Empty the console
	 *
	 * @param toLog [string|object] the item you want to log
	 */
	this.clear = function(){
		RenderedObj.innerHTML = '';
	};

	/*
	 * .setOption() - may be removed
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
	 * .getOption()
	 *
	 * @param toLog [property] the option you wish to retreive
	 */
	this.getOption = function(property){
		return options[property];
	};

	/*
	 * .getOptions()
	 * 
	 * Get all options
	 */
	this.getOptions = function(){
		return options;
	}

	/*
	 * .clear() - Clears console and resets to the default state
	 *
	 * @param options [object] defaults for the new console
	 */
	this.reset = function(options){
		//var previous_options = _loadPreviousOptions(); //returns nothing?
		_clearApplicationState();
		//_resetApplication();
		
		this.__init__();
	};

	//for dev only
	this.viewCookieData = function(name){
		return _getCookie('CalmConsole.' + name);
	};

	this.viewdata = function(name){
		//return _query(name);
		return localStorage.getItem('CalmConsole.'+ name);
	}
	this.setdata = function(name, data){
		return _store(name, data);
	}

/*
 * ---------------------------------------------------------------------------------
 *  Private methods
 * ---------------------------------------------------------------------------------
 */

	/*
	 * _resetApplication() - may be removed
	 */
	function _resetApplication(options){
		return new CalmConsole(options);
	};

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
	function _outputString(toLog, classes){
		var htmlObj = document.createElement('li');
			htmlObj.innerHTML = toLog;
			classes = (!classes ? 'msg-log' : classes);

		if(typeof classes == 'object'){
			htmlObj.classList.add(classes.join(' '));
		}else {
			htmlObj.classList.add(classes);
		}

		return htmlObj;
	};

	function _outputObject(toLog, classes){
		//TODO: build an object, use it as return value
		//TODO: loop through, get each element's innerText, add all that to the return object
		var outputObj = {}, clone = toLog;
		console.log('hihih');
		//for(var i = 0; i < toLog)

		return toLog;
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
			stylesheet.innerHTML = '.CalmConsole {position: fixed; '+ options.position +': 0px; width: 100%; height: 300px; font-size: 1em; color: black; overflow-y: auto; background: white; border-top: 1px solid rgba(0,0,0,0.3); font-family: "Lucida Sans Unicode";} .CalmConsole li {padding: 3px; margin: 0px; border-bottom: 1px solid rgba(0,0,0,0.3)} .CalmConsole .controls {position: absolute; right: 10px; top: 30%;} .CalmConsole.minimized {height: 41px; overflow: hidden; border-bottom: 0px;} .CalmConsole .msg-warning {background-color: #FCF8E3;} .CalmConsole .msg-special {background-color: #D9EDF7;} .CalmConsole .msg-error {background-color: #F2DEDE;} .CalmConsole .msg-success {background-color: #DFF0D8;} .CalmConsole ul {padding: 0px; margin: 0px;} .CalmConsole header {position: relative; font-family: Helvetica, Arial, sans-serif; border-bottom: 1px solid rgba(0,0,0,0.3); background-image: -ms-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -moz-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -o-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #FFFFFF), color-stop(1, #EEEEEE)); background-image: -webkit-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: linear-gradient(to bottom, #FFFFFF 0%, #EEEEEE 100%);} .CalmConsole header h2 {font-size: 1.5em; float: left; margin: 10px;} .CalmConsole header, .CalmConsole ul.msg-list {float: left; width: 100%; font-size: 11px;} .CalmConsole .controls a {position: relative; top: -12px; color: black; font-size: 3.5em; margin-left: 0.5em; text-decoration: none; opacity: 0.8; text-shadow: 1px 1px 1px #ddd;} .CalmConsole .controls a:hover {color: #E2237D; opacity: 1;} .CalmConsole.hidden {display: none;} .CalmConsole.page-top {border-top: 1px solid rgba(0,0,0,0.3);} .CalmConsole .controls .toggle {font-size: 2.4em; top: -16px;}';

		Loaded = true;

		return document.head.appendChild(stylesheet);
	};

	function _setApplicationState(){
		if(!_query('toggle')) _store('toggle', 0);
		if(!_query('close')) _store('close', 1);

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

	function _clearApplicationState(){
		_store('toggle', 0, 'Thu, 01 Jan 1970 00:00:01 GMT');
		_store('close', 1, 'Thu, 01 Jan 1970 00:00:01 GMT');
	
		return true;
	};

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
 *  Overwrite console.[method]
 * ---------------------------------------------------------------------------------
 */
	console.log = function(toLog){return _logAction(toLog);};
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
	});


