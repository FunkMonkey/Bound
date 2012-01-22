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
		//CPPAnalyzer.init();
		////var cppAST = CPPAnalyzer.parse_header(["supertest", "D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp"]);
		//var cppAST = CPPAnalyzer.parse_header(["supertest", "D:\\Data\\Projekte\\Bound\\src\\Wrapping\\Spidermonkey\\include\\Functions_BasicTypes.hpp"]);
		//CPPTree.setCPPAST(cppAST);
		//ExportTree.newExportAST(cppAST);
		
	},
};