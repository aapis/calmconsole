//TODO:
//- extend window.console so any regular console logs show up
//- push all logged messages to __actions (or something) and parse/display later to cut down on calls to .appendChild()
//- preserve login upon navigation (localstorage)
//- add documentation
var CalmConsole = function(options){
	'use strict';

	var CalmObj = this,
		RenderedObj = null,
		ActionList = null,
		Toggle = null,
		Close = null,
		__actions = [],
		options = (!options ? {} : options);;

	/*
	 * ---------------------------------------------------------------------------------
	 * Publicly accessible methods
	 * ---------------------------------------------------------------------------------
	 */
	this.__init__ = function(){
		if(window.console){
			console.warn('Your browser supports the Console, but CalmConsole won\'t affect it\'s functionality.');
		}
		
		//create the UI
		_loadUI();
		_loadListeners();

		return CalmObj;
	};

	this.log = function(toLog){
		//experimental
		var log = Function.prototype.bind.call(console.log, console);
		log.apply(CalmObj, [toLog]);
		//end experimental

		return _logAction(toLog);
	};

	this.warn = function(toLog){
		return _logAction(toLog, 'msg-warning');
	};

	this.error = function(toLog){
		return _logAction(toLog, 'msg-error');
	};

	this.success = function(toLog){
		return _logAction(toLog, 'msg-success');
	}

	this.special = function(toLog){
		return _logAction(toLog, 'msg-special');
	}

	this.clear = function(){
		RenderedObj.innerHTML = '';
	};

	/*
	 * ---------------------------------------------------------------------------------
	 *  Private methods
	 * ---------------------------------------------------------------------------------
	 */
	
	function _loadUI(){
		//Create the console
		var consoleElement = document.createElement('div');
			consoleElement.classList.add('CalmConsole');

		//Create the minimize/maximize toggle element
		var toggleElement = document.createElement('a');
			toggleElement.classList.add('toggle');
			toggleElement.innerHTML = 'Minimize';
			toggleElement.href = '#';

		//Create the close console element
		var closeElement = document.createElement('a');
			closeElement.classList.add('close');
			closeElement.innerHTML = 'Close';
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
		return toLog;
	};

	function _logAction(toLog, classes){
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
			stylesheet.innerHTML = '.CalmConsole {position: fixed; bottom: 0px; width: 100%; height: 300px; font-size: 1em; color: black; overflow: scroll; background: white; border-top: 1px solid rgba(0,0,0,0.3); font-family: "Lucida Sans Unicode";} .CalmConsole li {padding: 3px; margin: 0px; border-bottom: 1px solid rgba(0,0,0,0.3)} .CalmConsole .controls {position: absolute; right: 10px; top: 30%;} .CalmConsole.minimized {height: 41px;} .CalmConsole.minimized .toggle {background: rgba(0,0,0,0.1);} .CalmConsole .msg-warning {background-color: #FCF8E3;} .CalmConsole .msg-special {background-color: #D9EDF7;} .CalmConsole .msg-error {background-color: #F2DEDE;} .CalmConsole .msg-success {background-color: #DFF0D8;} .CalmConsole ul {padding: 0px; margin: 0px;} .CalmConsole header {position: relative; font-family: Helvetica, Arial, sans-serif; border-bottom: 1px solid rgba(0,0,0,0.3); background-image: -ms-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -moz-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -o-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #FFFFFF), color-stop(1, #EEEEEE)); background-image: -webkit-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: linear-gradient(to bottom, #FFFFFF 0%, #EEEEEE 100%);} .CalmConsole header h2 {font-size: 1.5em; float: left; margin: 10px;} .CalmConsole header, .CalmConsole ul.msg-list {float: left; width: 100%; font-size: 11px;} .CalmConsole .controls a {position: relative; top: 1px; color: black; margin-right: 1px; padding: 14px 13px; text-decoration: none;} .CalmConsole.hidden {display: none;}';

		return document.head.appendChild(stylesheet);
	};

	function _loadListeners(){
		Toggle.addEventListener('click', function(evt){
			evt.preventDefault();

			if(RenderedObj.classList.contains('minimized')){
				RenderedObj.classList.remove('minimized');
				Toggle.innerHTML = 'Minimize';

				_setCookie('CalmConsole.toggle', 0);
			}else {
				RenderedObj.classList.add('minimized');
				Toggle.innerHTML = 'Maximize';

				_setCookie('CalmConsole.toggle', 1);
			}
		});

		Close.addEventListener('click', function(evt){
			evt.preventDefault();

			if(options.removeOnClose){
				RenderedObj.parentElement.removeChild(RenderedObj);
				_setCookie('CalmConsole.close', 0);
			}else {
				RenderedObj.classList.add('hidden');
				_setCookie('CalmConsole.close', 1);
			}
		});
	};

	function _setCookie(name, value){
		var date = new Date();
		date.setDate(date.getDate() + 7);

		var value = escape(value) + "; expires=" + date.toUTCString();

		document.cookie = name + "=" + value;
	};

	function _getCookie(){

	}

	return this.__init__();
};

var calm = new CalmConsole({
		removeOnClose: false,
	});


