var EXPORTED_SYMBOLS = ["MainWindow"];

Components.utils.import("chrome://bound/content/modules/UI/main/CPPTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ExportTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ResultTabbox.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/PropertyExplorer.jsm");

Components.utils.import("chrome://bound/content/modules/CPPAnalyzer.jsm");

Components.utils.import("chrome://bound/content/modules/log.jsm");

// TEMP
//Components.utils.import("chrome://bound/content/modules/MetaDataHandler.jsm");
//Components.utils.import("chrome://bound/content/modules/ForwardProxy.jsm");

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
		
		ResultTabbox.init(this);
		
		// TODO: move somewhere else
		CPPAnalyzer.init();
		var path = "D:/Data/Projekte/Bound/src/CPPAnalyzer/Test/";
		var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "test1.cpp"]);
		//var path = "D:/Data/Projekte/Bound/src/Wrapping/Spidermonkey/WrappingTest/include/";
		//var cppAST = CPPAnalyzer.parse_header(path, ["supertest", path + "SimpleClass.hpp"]);
		
		this.CPPTree.setCPPAST(cppAST);
		this.ExportTree.newExportAST(cppAST);
		
		//var proxyHandler = new ForwardProxyHandler(cppAST.root.children[2]);
		//var proxy = Proxy.create(proxyHandler, Object.getPrototypeOf(proxyHandler.obj));
		//var handler = new MetaDataHandler(proxy, this.$window);
		//this.PropertyExplorer.setDataHandler(handler);
	},
};