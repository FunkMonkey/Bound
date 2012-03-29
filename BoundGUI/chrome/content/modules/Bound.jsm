var EXPORTED_SYMBOLS = ["Bound"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/CPPAnalyzer.jsm");
Components.utils.import("chrome://bound/content/modules/Project/Project.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");

/**
 * Main entry point for accessing Bound
 * @namespace
 *
 * @property  {Object}      MainWindow      Main window accessor
 * @property  {DOMWindow}   window          Main window
 * @property  {string}      currentContext  Current code generation context
 * @property  {Project}     currentProject  Current project
 *
 * @type Object
 */
var Bound = {
	
	/**
	 * Initializes the application
	 * 
	 * @param   {Object}   mainWindowModule   Main-window JSM
	 */
	init: function init(mainWindow, window)
	{
		CPPAnalyzer.init();
		this.MainWindow = mainWindow;
		this.currentContext = "CPP_Spidermonkey";
		this.window = window;
		
		this.currentProject = new Project();
		var projOptions = this.currentProject.options;
		
		// TODO: remove
		projOptions.clangArguments = Services.prefs.getCharPref("bound.lastProject.clangArguments");
		projOptions.fileNameFilter = Services.prefs.getCharPref("bound.lastProject.fileNameFilter");
		projOptions.symbolNameFilter = Services.prefs.getCharPref("bound.lastProject.symbolNameFilter");
		projOptions.accessFilter = Services.prefs.getIntPref("bound.lastProject.accessFilter");		
	},
	
	/**
	 * Reparses the current project
	 */
	reparseCurrentProject: function reparseCurrentProject()
	{
		var projectOptions = this.currentProject.options;
		var cppAST = CPPAnalyzer.parse_header("", projectOptions.clangArguments, projectOptions.fileNameFilter, projectOptions.symbolNameFilter, projectOptions.accessFilter);
	
		this.currentProject.cppAST = cppAST;
	}, 
	
	
	/**
	 * Quits the application
	 * 
	 * @param   {boolean} aForceQuit If true, quitting is forced
	 */
	quit: function quit(aForceQuit)
	{
		var appStartup = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
		// eAttemptQuit will try to close each XUL window, but the XUL window can cancel the quit
		// process if there is unsaved data. eForceQuit will quit no matter what.
		var quitSeverity = aForceQuit ? Ci.nsIAppStartup.eForceQuit : Ci.nsIAppStartup.eAttemptQuit;
		appStartup.quit(quitSeverity);
	},
	
	/**
	 * Generic error handler called for specially wrapped functions
	 * 
	 * @param   {Error}      e         Error caught
	 * @param   {Function}   wrapped   Wrapped function
	 * @param   {Object}     theThis   Context
	 * @param   {Array}      args      Argumetns passed
	 * 
	 * @returns {boolean}   True if handled, false if rethrown
	 */
	errorCallback: function errorCallback(e, wrapped, theThis, args)
	{
		log("called on error")
		
		if(typeof e === "object" && e)
			Bound.window.alert("Unexpected error: " + e.message + "\n\n" + e.stack);
		else
			Bound.window.alert("Unexpected error: " + e)
			
		return false;
	}, 
	
	
}

