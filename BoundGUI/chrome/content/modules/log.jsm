
var EXPORTED_SYMBOLS = ["log", "LogUtils"];

const consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

function log(str)
{
	if(log.useJSConsole)
	{
		if(str == null)
			str = "" + str;
		consoleService.logStringMessage(str);
	}
	
	if(log.useFirebug && log.firebugLog)
		log.firebugLog(str);
}

log.useFirebug = true;
log.firebugLog = null;
log.useJSConsole = true;

var LogUtils = {
	/**
	 * Logs the given object
	 * 
	 * @param   {Object}    object      Object to log
	 * @param   {boolean}   recursive   Log recursively
	 */
	logObject: function logObject(object, recursive)
	{
		// TODO: recursive
		var str = "";
		for(var member in object)
		{
			str += member + ": " + object[member] + "\n";
		}
		
		log(str);
	},
	
	/**
	 * Summary
	 *
	 * @param   {Error}    e      Exception to log
	 */
	logStack: function logStack(e)
	{
		if(e)
			log(e.stack)
		else
		{
			try{throw new Error()}catch(e){log(e.stack)}
		}
	}, 
	
	
}