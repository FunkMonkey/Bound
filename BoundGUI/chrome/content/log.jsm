
var EXPORTED_SYMBOLS = ["log"];

const consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

function jsdump(str)
{
  
            
}

function log(str)
{
	if(log.useJSConsole)
	{
		if(typeof(str) === "undefined")
			str = "undefined";
		consoleService.logStringMessage(str);
	}
	
	if(log.useFirebug && log.firebugLog)
		log.firebugLog(str);
}

log.useFirebug = true;
log.firebugLog = null;
log.useJSConsole = true;