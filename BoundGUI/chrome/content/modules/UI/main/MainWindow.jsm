var EXPORTED_SYMBOLS = ["MainWindow"];

Components.utils.import("chrome://bound/content/modules/UI/main/CPPTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ExportTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ResultTabbox.jsm");

Components.utils.import("chrome://bound/content/modules/CPPAnalyzer.jsm");

var MainWindow = {
	
	/**
	 * Initializes the Export tree
	 * 
	 * @param   {element}   mainWindow   Main window
	 */
	init: function init(mainWindow)
	{
		this.$window = mainWindow;
		this.$document = mainWindow.document;
		
		this.CPPTree = CPPTree;
		this.ExporTree = ExportTree;
		this.ResultTabbox = ResultTabbox;
		
		CPPTree.init(this);
		ExportTree.init(this);
		ResultTabbox.init(this);
		
		// TODO: move somewhere else
		CPPAnalyzer.init();
		//var path = "D:/Data/Projekte/Bound/src/CPPAnalyzer/Test/";
		//var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "test1.cpp"]);
		////var path = "D:/Data/Projekte/Bound/src/Wrapping/Spidermonkey/include/";
		////var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "Functions_BasicTypes.hpp"]);
		//CPPTree.setCPPAST(cppAST);
		//ExportTree.newExportAST(cppAST);
		
	},
};