var EXPORTED_SYMBOLS = ["MainWindow"];

Components.utils.import("chrome://bound/content/modules/UI/main/CPPTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ExportTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ResultTabbox.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/PropertyExplorer.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/LogBox.jsm");

Components.utils.import("chrome://bound/content/modules/CPPAnalyzer.jsm");

Components.utils.import("chrome://bound/content/modules/log.jsm");

// TEMP

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
		
		this.CPPTree = initCPPTree(this);
		this.ExportTree = initExportTree(this);
		this.ResultTabbox = ResultTabbox;
		this.PropertyExplorer = initPropertyExplorer(this);
		this.LogBox = LogBox;
		
		ResultTabbox.init(this);
		LogBox.init(this);
		
		// TODO: move somewhere else
			CPPAnalyzer.init();
			var path = "D:/Data/Projekte/Bound/src/CPPAnalyzer/Test/";
			var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "STD.hpp"], ".*STD.hpp", ".*", 8);
			
			//var path = "D:/Data/Projekte/Bound/src/Wrapping/Spidermonkey/WrappingTest/include/";
			//var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "SimpleClass.hpp"]);
			
			//var path = "D:/Data/Projekte/Bound/src/Wrapping/Spidermonkey/WrappingTest/include/";
			//var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "Functions_BasicTypes.hpp"]);
			
			this.CPPTree.setCPPAST(cppAST);
			this.ExportTree.newExportAST(cppAST);
			this.LogBox.showMessagesFromCPPAST(cppAST);
			
			//var proxyHandler = new ForwardProxyHandler(cppAST.root.children[2]);
			//var proxy = Proxy.create(proxyHandler, Object.getPrototypeOf(proxyHandler.obj));
			//var handler = new MetaDataHandler(proxy, this.$window);
			//this.PropertyExplorer.setDataHandler(handler);
		
	},
};