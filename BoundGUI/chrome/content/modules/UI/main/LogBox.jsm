var EXPORTED_SYMBOLS = ["LogBox"];

Components.utils.import("chrome://bound/content/modules/Bound.jsm");

var MainWindow = null;
var document = null;

var LogBox = {
	
	/**
	 * Initializes the logbox
	 * 
	 * @param   {Object}   mainWindowModule   JSM for the main window
	 */
	init: function init(mainWindowModule)
	{
		MainWindow = mainWindowModule;
		document = MainWindow.$document;
		
		this.$logBox = document.getElementById("logBox");
		
	},
	
	/**
	 * Adds a log message entry
	 * 
	 * @param   {Object}   entry   
	 */
	addLogMessageEntry: function addLogMessageEntry(entry, category)
	{
		var $row = document.createElement("label");
		$row.setAttribute("value", category + " " + entry.type + ": " + entry.message);
		$row.setAttribute("logType", entry.type);
		this.$logBox.appendChild($row);
	}, 
	
	
	/**
	 * Shows messages from the given CPPAST
	 * 
	 * @param   {CPP_AST}   ast   AST to show messages for
	 */
	showMessagesFromCPPAST: function showMessagesFromCPPAST(ast)
	{
		for(var i = 0; i < ast.logMessages.Clang.length; ++i)
			this.addLogMessageEntry(ast.logMessages.Clang[i], "Clang");
			
		for(var i = 0; i < ast.logMessages.Export.length; ++i)
			this.addLogMessageEntry(ast.logMessages.Export[i], "Export");
	}, 
	
}