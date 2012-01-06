var EXPORTED_SYMBOLS = ["Plugin_CPP_Spidermonkey"];

Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");

Components.utils.import("chrome://bound/content/modules/TemplateManager.jsm");

/**
 * 
 *
 * @constructor
 * @this {Plugin_CPP_Spidermonkey}
 */
function Plugin_CPP_Spidermonkey()
{
	
}

Plugin_CPP_Spidermonkey.prototype = {
	constructor: Plugin_CPP_Spidermonkey,
	
	/**
	 * Returns a code generator that is compatible with the given ASTObject
	 * 
	 * @param   {ASTObject|AstOverloadContainer}   astObject   ASTObject to find codegen for
	 * 
	 * @returns {CodeGenerator}   Codegenerator that is compatible, or null
	 */
	getCodeGeneratorByASTObject: function getCodeGeneratorByASTObject(astObject)
	{
		if(!astObject)
			return null;
		
		// check the source language
		// only C++ and custom ASTObjects allowed
		if( !(astObject instanceof CPP_ASTObject) &&
		    !(astObject instanceof ASTOverloadContainer && astObject.overloads[0] instanceof CPP_ASTObject))
			return null;
		
		var kind = astObject.getKindAsString();
		
		switch(kind)
		{
			case "Function": return CodeGenerator_Function;
		}
		
		return null;
	}, 
};

/**
 * Code generator for a function
 *
 * @constructor
 * @this {CodeGenerator_Function}
 */
function CodeGenerator_Function()
{
	this.exportObject = null;
}

CodeGenerator_Function.prototype = {
	constructor: CodeGenerator_Function,
	context: "CPP_Spidermonkey"
	
}; 