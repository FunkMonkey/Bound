var EXPORTED_SYMBOLS = ["MainWindow"];

Components.utils.import("chrome://bound/content/modules/UI/main/CPPTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ExportTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ResultTabbox.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/PropertyExplorer.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/LogBox.jsm");

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/Bound.jsm");

// TEMP

/**
 * Provides access to the functionality and GUI widgets of the main window
 * @namespace
 *
 * @type Object
 */
var MainWindow = {
	
	/**
	 * Initializes the main window
	 * 
	 * @param   {element}   mainWindow   Main window
	 */
	init: function init(mainWindow)
	{
		this.$window = mainWindow;
		this.$document = mainWindow.document;
		
		this.CPPTree = initCPPTree(this);
		this.ExportTree = initExportTree(this);
		this.ResultTabbox = ResultTabbox;
		this.PropertyExplorer = initPropertyExplorer(this);
		this.LogBox = LogBox;
		
		ResultTabbox.init(this);
		LogBox.init(this);
		
		var project = Bound.currentProject;
		if(project.cppAST)
		{
			MainWindow.CPPTree.setCPPAST(project.cppAST);
			MainWindow.LogBox.showMessagesFromCPPAST(project.cppAST);
		}
		MainWindow.ExportTree.setExportAST(project.exportAST);
		
	},
};