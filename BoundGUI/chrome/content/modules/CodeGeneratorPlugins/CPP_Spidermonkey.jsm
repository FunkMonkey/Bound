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
			case "MemberFunction": codegen = CodeGenerator_Function; break;
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
		"Bool":      "CPP_Spidermonkey/param_jsval_to_boolean",
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
	
	returnTemplates: {
		"Bool":      "CPP_Spidermonkey/return_boolean",
		"Char_U":    "CPP_Spidermonkey/return_int", // ???
		"UChar":     "CPP_Spidermonkey/return_int",
		"Char16":    "CPP_Spidermonkey/return_int",
		"Char32":    "CPP_Spidermonkey/return_int",
		"UShort":    "CPP_Spidermonkey/return_int",
		"UInt":      "CPP_Spidermonkey/return_int",
		"ULong":     "CPP_Spidermonkey/return_int",
		"ULongLong": "CPP_Spidermonkey/return_int",
		"UInt128":   "CPP_Spidermonkey/return_int",
		"Char_S":    "CPP_Spidermonkey/return_int", // ???
		"SChar":     "CPP_Spidermonkey/return_int",
		"WChar":     "CPP_Spidermonkey/return_int", // TODO: may change
		"Short":     "CPP_Spidermonkey/return_int",
		"Int":       "CPP_Spidermonkey/return_int",
		"Long":      "CPP_Spidermonkey/return_int",
		"LongLong":  "CPP_Spidermonkey/return_int",
		"Int128":    "CPP_Spidermonkey/return_int",
		"Float":     "CPP_Spidermonkey/return_float",
		"Double":    "CPP_Spidermonkey/return_float",
		"LongDouble":"CPP_Spidermonkey/return_float"
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
		var call_parameters = "";
		for(var i = 0; i < astFunc.parameters.length; ++i)
		{
			var param = astFunc.parameters[i];
			var name = "p__" + param.name;
			parameters_init += TemplateManager.fetch(this.parameterTemplates[param.typeCanonical.kind], {param_name: name, param_type: param.typeCanonical.getAsCPPCode(), param_index: i}) + "\n";
		
			call_parameters += name + ((i != astFunc.parameters.length - 1) ? ", " : "");
		}
		
		var parent_qualifier = astFunc.parent.cppLongName;
		
		var data = {
			is_instance_call: (astFunc.kind === ASTObject.KIND_MEMBER_FUNCTION && !astFunc.isStatic),
			parameters_init: parameters_init,
			call_parameters: call_parameters,
			parent_qualifier: parent_qualifier,
			wrapper_funcName: "wrapper_" + this.exportObject.name,
			funcName: this.exportObject.sourceObject.name,
		}
		
		if(astFunc.returnTypeCanonical.kind !== "Void")
		{
			data.return_type = astFunc.returnTypeCanonical.getAsCPPCode();
			data.returnCode = TemplateManager.fetch(this.returnTemplates[astFunc.returnTypeCanonical.kind], {});
		}
		else
		{
			data.returnCode = TemplateManager.fetch("CPP_Spidermonkey/return_void", {});
		}
		
		return TemplateManager.fetch("CPP_Spidermonkey/function", data);
	}, 
	
	
};

TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/function");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_boolean");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_int");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_uint");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_float");

TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_void");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_boolean");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_int");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_float");
//log();