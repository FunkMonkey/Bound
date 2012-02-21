var EXPORTED_SYMBOLS = ["Bound"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Components.utils.import("chrome://bound/content/modules/CPPAnalyzer.jsm");
Components.utils.import("chrome://bound/content/modules/Project/Project.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");


var Bound = {
	
	/**
	 * Initializes the application
	 * 
	 * @param   {Object}   mainWindowModule   Main-window JSM
	 */
	init: function init(mainWindow)
	{
		CPPAnalyzer.init();
		this.MainWindow = mainWindow;
		this.currentContext = "CPP_Spidermonkey";
		
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
	
		//var path = "D:/Data/Projekte/Bound/src/Wrapping/Spidermonkey/WrappingTest/include/";
		//var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "SimpleClass.hpp"]);
		
		//var path = "D:/Data/Projekte/Bound/src/Wrapping/Spidermonkey/WrappingTest/include/";
		//var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "Functions_BasicTypes.hpp"]);
		
		this.currentProject.cppAST = cppAST;
	}, 
	
	
	
	quit: function quit(aForceQuit)
	{
		var appStartup = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
		// eAttemptQuit will try to close each XUL window, but the XUL window can cancel the quit
		// process if there is unsaved data. eForceQuit will quit no matter what.
		var quitSeverity = aForceQuit ? Ci.nsIAppStartup.eForceQuit : Ci.nsIAppStartup.eAttemptQuit;
		appStartup.quit(quitSeverity);
	}
}

