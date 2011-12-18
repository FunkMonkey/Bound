
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

var EXPORTED_SYMBOLS = ["Bound"];

let Bound = {
	quit: function quit(aForceQuit)
	{
		var appStartup = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
		// eAttemptQuit will try to close each XUL window, but the XUL window can cancel the quit
		// process if there is unsaved data. eForceQuit will quit no matter what.
		var quitSeverity = aForceQuit ? Ci.nsIAppStartup.eForceQuit : Ci.nsIAppStartup.eAttemptQuit;
		appStartup.quit(quitSeverity);
	}
}
