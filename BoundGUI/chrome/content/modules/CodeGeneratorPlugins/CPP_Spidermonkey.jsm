var EXPORTED_SYMBOLS = ["Plugin_CPP_Spidermonkey"];

Components.utils.import("chrome://bound/content/modules/log.jsm");

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
	
	context: "CPP_Spidermonkey",
	
	/**
	 * Returns a code generator that is compatible with the given ASTObject
	 * 
	 * @param   {ASTObject|ASTOverloadContainer}   astObject   ASTObject to find codegen for
	 * 
	 * @returns {CodeGenerator}   Codegenerator that is compatible, or null
	 */
	getCodeGeneratorByASTObject: function getCodeGeneratorByASTObject(astObject)
	{
		if(!astObject)
			return null;
		
		if(!astObject.getKindAsString)
			return null;
		
		var kind = astObject.getKindAsString();
		
		var codegen;
		switch(kind)
		{
			case "Function": codegen = CodeGenerator_Function; break;
			default: return null;
		}
		
		return (codegen.isCompatible(astObject)) ? codegen : null;
	},
	
	/**
	 * Checks if the given ASTObject is compatible with the plugin
	 * 
	 * @param   {ASTObject|ASTOverloadContainer}   obj   ASTObject to check compatibility for
	 * 
	 * @returns {boolean}   True if compatible, otherwise false
	 */
	_isCompatible: function _isCompatible(astObject)
	{
		// check the source language
		// only C++ and custom ASTObjects allowed
		if( (astObject instanceof CPP_ASTObject) ||
		    (astObject instanceof ASTOverloadContainer && astObject.overloads[0] instanceof CPP_ASTObject))
			return true;
		else
			return false;
	}, 
	
};

/**
 * Code generator for a function
 *
 * @constructor
 * @this {CodeGenerator_Function}
 */
function CodeGenerator_Function(plugin)
{
	this.plugin = plugin;
	this.exportObject = null;
}

CodeGenerator_Function.isCompatible = Plugin_CPP_Spidermonkey.prototype._isCompatible;

CodeGenerator_Function.prototype = {
	constructor: CodeGenerator_Function,
	context: Plugin_CPP_Spidermonkey.prototype.context,
	
	parameterTemplates: {
		"Bool":      "bool",
		"Char_U":    "CPP_Spidermonkey/param_jsval_to_int", // ???
		"UChar":     "CPP_Spidermonkey/param_jsval_to_uint",
		"Char16":    "CPP_Spidermonkey/param_jsval_to_int",
		"Char32":    "CPP_Spidermonkey/param_jsval_to_int",
		"UShort":    "CPP_Spidermonkey/param_jsval_to_uint",
		"UInt":      "CPP_Spidermonkey/param_jsval_to_uint",
		"ULong":     "CPP_Spidermonkey/param_jsval_to_uint",
		"ULongLong": "CPP_Spidermonkey/param_jsval_to_uint",
		"UInt128":   "CPP_Spidermonkey/param_jsval_to_uint",
		"Char_S":    "CPP_Spidermonkey/param_jsval_to_int", // ???
		"SChar":     "CPP_Spidermonkey/param_jsval_to_int",
		"WChar":     "CPP_Spidermonkey/param_jsval_to_int", // TODO: may change
		"Short":     "CPP_Spidermonkey/param_jsval_to_int",
		"Int":       "CPP_Spidermonkey/param_jsval_to_int",
		"Long":      "CPP_Spidermonkey/param_jsval_to_int",
		"LongLong":  "CPP_Spidermonkey/param_jsval_to_int",
		"Int128":    "CPP_Spidermonkey/param_jsval_to_int",
		"Float":     "CPP_Spidermonkey/param_jsval_to_float",
		"Double":    "CPP_Spidermonkey/param_jsval_to_float",
		"LongDouble":"CPP_Spidermonkey/param_jsval_to_float"
	},
	
	/**
	 * Generates wrapper code for the connected function
	 * 
	 * @returns {String}   Wrapper code
	 */
	generate: function generate()
	{
		var astFunc = this.exportObject.sourceObject;
		
		var parameters_init = "";
		for(var i = 0; i < astFunc.parameters.length; ++i)
		{
			var param = astFunc.parameters[i];
			parameters_init += TemplateManager.fetch(this.parameterTemplates[param.typeCanonical.kind], {param_name: param.name, param_type: param.typeCanonical.getAsCPPCode(), param_index: i});
		}
		
		
		
		var data = {
			parameters_init: parameters_init,
			wrapper_funcName: "wrapper_" + this.exportObject.name,
			funcName: this.exportObject.sourceObject.name,
		}
		
		return TemplateManager.fetch("CPP_Spidermonkey/function", data);
	}, 
	
	
};

TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/function");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_int");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_uint");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_float");
//log();