var EXPORTED_SYMBOLS = ["LogBox"];

Components.utils.import("chrome://bound/content/modules/Bound.jsm");
Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/UI/Widgets/LoggerOutput.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/Logger.jsm");

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
		
		this.$logBoxCPP = document.getElementById("logBoxCPP");
		createLoggerOutputOn(this.$logBoxCPP);
		
		this.codeGenLogger = new Logger();
		this.$logBoxCodeGen = document.getElementById("logBoxCodeGeneration");
		createLoggerOutputOn(this.$logBoxCodeGen);
		this.$logBoxCodeGen.setLogger(this.codeGenLogger);
	},
	
	/**
	 * Adds the messages from diagnosis
	 * 
	 * @param   {ExportASTObject}   astObject   Object to retrieve diagnosis from
	 * @param   {String}            context     Context to retrieve diagnosis from
	 * @param   {boolean}           recursive   If true, do it recursively
	 */
	showDiagnosisMessages: function showDiagnosisMessages(astObject, context, recursive)
	{
		var codeGen = astObject.getCodeGenerator(context);
		if(codeGen && codeGen._genInput && codeGen._genInput.diagnosis)
		{
			var messages = codeGen._genInput.diagnosis.reports;
			for(propName in messages)
			{
				switch(messages[propName].type)
				{
					case "INFO":
						this.codeGenLogger.addInfoMessage(messages[propName].name + ": " + messages[propName].message);
						break;
					case "WARNING":
						this.codeGenLogger.addWarningMessage(messages[propName].name + ": " + messages[propName].message);
						break;
					case "ERROR":
						this.codeGenLogger.addErrorMessage(messages[propName].name + ": " + messages[propName].message);
						break;
				}
			}
		}
		
		if(recursive)
		{
			for(var i = 0, len = astObject.children.length; i < len; ++i)
				this.showDiagnosisMessages(astObject.children[i], context, true);
		}
	}, 
	
	
	
	/**
	 * Shows messages from the given CPPAST
	 * 
	 * @param   {CPP_AST}   ast   AST to show messages for
	 */
	showMessagesFromCPPAST: function showMessagesFromCPPAST(ast)
	{
		this.$logBoxCPP.setLogger(ast.logger, true);
	}, 
	
}