//TODO:
//- extend window.console so any regular console logs show up [IN PROGRESS]
//- compatibility with IE
//- push all logged messages to __actions (or something) and parse/display later
var CalmConsole = function(){
	'use strict';

	var CalmObj = this;
	var RenderedObj = null;

	/*
	 * Publicly accessible methods
	 */
	this.__init__ = function(){
		if(window.console){
			console.warn('Your browser supports the Console, but CalmConsole won\'t affect it\'s functionality.');
		}

		var consoleElement = document.createElement('div');
			consoleElement.classList.add('CalmConsole');

		var toggleElement = document.createElement('a');
			toggleElement.classList.add('toggle');
			toggleElement.innerHTML = 'Hide';
			toggleElement.href = '#';

		RenderedObj = consoleElement;

		document.body.appendChild(RenderedObj);
		RenderedObj.appendChild(toggleElement);

		//style the console
		_loadStyles();
		_loadListeners();

		return CalmObj;
	};

	this.log = function(toLog){
		var log = Function.prototype.bind.call(console.log, console);
		log.apply(CalmObj, [toLog]);

		return _logAction(toLog);
	};

	this.warn = function(toLog){
		return _logAction(toLog, 'msg-warning');
	};

	this.error = function(toLog){
		return _logAction(toLog, 'msg-error');
	};

	this.clear = function(){
		RenderedObj.innerHTML = '';
	};

	/*
	 * Private methods
	 */
	

	/*
	 * @param toLog [string]
	 * @param classes [string|array]
	 */
	function _outputString(toLog, classes){
		var htmlObj = document.createElement('p');
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
		//build an object, use it as return value
		return toLog;
	};

	function _logAction(toLog, classes){
		if(typeof toLog == 'string'){
			RenderedObj.appendChild(_outputString(toLog, classes));
		}else {
			RenderedObj.appendChild(_outputObject(toLog, classes));
		}

		return null;
	};

	function _loadStyles(){
		var stylesheet = document.createElement('style');
			stylesheet.innerHTML = '.CalmConsole {position: fixed; bottom: 0px; width: 100%; height: 300px; color: black; overflow: scroll; background: white; border-top: 1px solid black; font-family: Courier;} .CalmConsole p {padding: 3px; margin: 0px; border-bottom: 1px solid rgba(0,0,0,0.3)} .CalmConsole .toggle {float: right;} .CalmConsole.minified {height: auto;} .CalmConsole .msg-warning {background: yellow;} .CalmConsole .msg-error {background: red;}';

		return document.head.appendChild(stylesheet);
	};

	function _loadListeners(){
		var toggle_action_obj = document.querySelector('.CalmConsole .toggle');
			toggle_action_obj.addEventListener('click', function(evt){
				evt.preventDefault();

				if(RenderedObj.classList.contains('minified')){
					RenderedObj.classList.remove('minified');
					toggle_action_obj.innerHTML = 'Hide';
				}else {
					RenderedObj.classList.add('minified');
					toggle_action_obj.innerHTML = 'Show';
				}
			});
	}
};

var calm = new CalmConsole;
	calm.__init__();


