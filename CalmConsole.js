//TODO:
//- extend window.console so any regular console logs show up [IN PROGRESS]
//- compatibility with IE
//- push all logged messages to __actions (or something) and parse/display later to cut down on calls to .appendChild()
//- preserve login upon navigation (localstorage)
var CalmConsole = function(options){
	'use strict';

	var CalmObj = this;
	var RenderedObj = null;
	var ActionList = null;
	var Toggle = null;

	/*
	 * ---------------------------------------------------------------------------------
	 * Publicly accessible methods
	 * ---------------------------------------------------------------------------------
	 */
	this.__init__ = function(options){
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
		var consoleElement = document.createElement('div');
			consoleElement.classList.add('CalmConsole');

		var toggleElement = document.createElement('a');
			toggleElement.classList.add('toggle');
			toggleElement.innerHTML = 'Minimize';
			toggleElement.href = '#';

		var headerElement = document.createElement('header');
			headerElement.classList.add('header');
			headerElement.innerHTML = '<h2>CalmConsole</h2>';

		var listElement = document.createElement('ul');
			listElement.classList.add('msg-list');

		ActionList = listElement;
		RenderedObj = consoleElement;
		Toggle = toggleElement;

		//add CalmConsole to the DOM
		document.body.appendChild(RenderedObj);

		//add the various UI elements too
		headerElement.appendChild(toggleElement);
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
		//build an object, use it as return value
		return toLog;
	};

	function _logAction(toLog, classes){
		if(typeof toLog == 'string'){
			ActionList.appendChild(_outputString(toLog, classes));
		}else {
			ActionList.appendChild(_outputObject(toLog, classes));
		}

		return null;
	};

	function _loadStyles(){
		var stylesheet = document.createElement('style');
			stylesheet.innerHTML = '.CalmConsole {position: fixed; bottom: 0px; width: 100%; height: 300px; color: black; overflow: scroll; background: white; border-top: 1px solid rgba(0,0,0,0.3); font-family: "Lucida Sans Unicode";} .CalmConsole li {padding: 3px; margin: 0px; border-bottom: 1px solid rgba(0,0,0,0.3)} .CalmConsole .toggle {position: absolute; right: 10px; top: 30%;} .CalmConsole.minimized {height: 41px;} .CalmConsole.minimized .toggle {background-color: rgba(0,0,0,1);} .CalmConsole .msg-warning {background-color: #FCF8E3;} .CalmConsole .msg-special {background-color: #D9EDF7;} .CalmConsole .msg-error {background-color: #F2DEDE;} .CalmConsole .msg-success {background-color: #DFF0D8;} .CalmConsole ul {padding: 0px; margin: 0px;} .CalmConsole header {position: relative; font-family: Helvetica, Arial, sans-serif; border-bottom: 1px solid rgba(0,0,0,0.3); background-image: -ms-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -moz-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -o-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, #FFFFFF), color-stop(1, #EEEEEE)); background-image: -webkit-linear-gradient(top, #FFFFFF 0%, #EEEEEE 100%); background-image: linear-gradient(to bottom, #FFFFFF 0%, #EEEEEE 100%);} .CalmConsole header h2 {float: left; margin: 10px;} .CalmConsole header, .CalmConsole ul.msg-list {float: left; width: 100%; font-size: 11px;} .CalmConsole a {color: white; background: rgba(0,0,0,0.4); border-radius: 4px; padding: 3px; text-decoration: none;}';

		return document.head.appendChild(stylesheet);
	};

	function _loadListeners(){
		//var toggle_action_obj = document.querySelector('.CalmConsole .toggle');
			Toggle.addEventListener('click', function(evt){
				evt.preventDefault();

				if(RenderedObj.classList.contains('minimized')){
					RenderedObj.classList.remove('minimized');
					Toggle.innerHTML = 'Minimize';
				}else {
					RenderedObj.classList.add('minimized');
					Toggle.innerHTML = 'Maximize';
				}
			});
	}
};

var calm = new CalmConsole;
	calm.__init__();

