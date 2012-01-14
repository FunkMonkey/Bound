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
	 * @param   {ASTObject|ASTOverloadContainer}          astObject             ASTObject to find codegen for
	 * @param   {CodeGenerator}                           exportParentCodegen   The export parents codegen
	 * 
	 * @returns {CodeGenerator}   Codegenerator that is compatible, or null
	 */
	getCodeGeneratorByASTObject: function getCodeGeneratorByASTObject(astObject, exportParentCodegen)
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
			case "Namespace": codegen = CodeGenerator_Object; break;
			default: return null;
		}
		
		return (codegen.isCompatible(astObject, exportParentCodegen)) ? codegen : null;
	},
	
	/**
	 * Checks if the given ASTObject is compatible with the plugin
	 * 
	 * @param   {ASTObject|ASTOverloadContainer}   obj                   ASTObject to check compatibility for
	 * @param   {CodeGenerator}                    exportParentCodegen   The export parents codegen
	 * 
	 * @returns {boolean}   True if compatible, otherwise false
	 */
	_isCompatible: function _isCompatible(astObject, exportParentCodegen)
	{
		// check the source language
		// only C++ and custom ASTObjects allowed
		
		if( !(astObject instanceof CPP_ASTObject)
		    /* ||
		    !(astObject instanceof ASTOverloadContainer && astObject.overloads[0] instanceof CPP_ASTObject)*/)
			return false;
		
		// root object hack
		if(astObject.parent == null)
			return true;
		
		if(!exportParentCodegen || !(exportParentCodegen instanceof CodeGenerator_Object))
			return false;
		
		return true;
	},
	
	/**
	 * Generates wrapper code for the connected function
	 * 
	 * @returns {Object}   Wrapper code for the different places
	 */
	generate: function generate()
	{
	}
	
};

/**
 * Code generator for functions and member functions
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
	
	get isStatic()
	{
		return this.exportObject.sourceObject.isStatic;
	},
	
	/**
	 * Generates wrapper code for the connected function
	 * 
	 * @returns {Object}   Wrapper code for the different places
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
		
		var defineData = {
			wrapper_funcName: data.wrapper_funcName,
			funcName: this.exportObject.name,
			num_params: astFunc.parameters.length
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
		
		return {  wrapper_function_code: TemplateManager.fetch("CPP_Spidermonkey/function", data),
		          define_code:           TemplateManager.fetch("CPP_Spidermonkey/function_define", defineData)};
	}, 
};

/**
 * Code generator for objects
 *
 * @constructor
 * @this {CodeGenerator_Object}
 */
function CodeGenerator_Object(plugin)
{
	this.plugin = plugin;
	this.exportObject = null;
}

CodeGenerator_Object.isCompatible = Plugin_CPP_Spidermonkey.prototype._isCompatible;

CodeGenerator_Object.prototype = {
	constructor: CodeGenerator_Object,
	context: Plugin_CPP_Spidermonkey.prototype.context,
	
	/**
	 * Generates wrapper code for the connected function
	 * 
	 * @returns {Object}   Wrapper code for the different places
	 */
	generate: function generate()
	{
		var scopeObj = this.exportObject;
		
		var isInline = (scopeObj.children.length === 0) && (scopeObj.parent !== null);
		
		// ------ children ------
		
		var cppIncludes = [];
		var files = {};
		var childCodesScopes = [];
		var childCodesFunctions = [];
		// adding children recursively
		for(var i = 0; i < scopeObj.children.length; ++i)
		{
			var child = scopeObj.children[i];
			var childCodeGen = child.getCodeGenerator(this.context);
			if(childCodeGen)
			{
				var childCode = childCodeGen.generate();
				if(childCodeGen instanceof CodeGenerator_Object)
				{
					
				}
				else if(childCodeGen instanceof CodeGenerator_Function)
				{
					
				}
			}
		}
		
		// ------ header ------
		var hpp_scopeContent = "";
		
		// TODO: inline children
		
		hpp_scopeContent += TemplateManager.fetch("CPP_Spidermonkey/hpp_scope_content_init", {});
		var hpp_scope_definition = TemplateManager.fetch("CPP_Spidermonkey/scope_definition", { scopeName: scopeObj.name, scopeContent: hpp_scopeContent});
		
		// ------ cpp ------
		
		var cpp_scopeContent = "";
		
		// TODO: inline children
		// TODO: wrapper code
		// TODO: init
		
		//cpp_scopeContent += TemplateManager.fetch("CPP_Spidermonkey/hpp_scope_content_init", {});
		var cpp_scope_definition = TemplateManager.fetch("CPP_Spidermonkey/scope_definition", { scopeName: scopeObj.name, scopeContent: cpp_scopeContent});
		
		// ------ result ------
		if(isInline)
		{
			return { isInline: true,
			         hpp_scope_definition: hpp_scope_definition};
		}
		else
		{
			var nameChain = this.getNameChain();
			var includeGuard = "JSWRAP_"
			var fileName = "";
			for(var i = 0; i < nameChain.length; ++i)
			{
				includeGuard += nameChain[i];
				fileName += nameChain[i];
				
				
				if(i != nameChain.length - 1)
				{
					includeGuard += "_";
					fileName += "/";
					
					hpp_scope_definition = TemplateManager.fetch("CPP_Spidermonkey/scope_definition", { scopeName: nameChain[i], scopeContent: hpp_scope_definition});
					cpp_scope_definition = TemplateManager.fetch("CPP_Spidermonkey/scope_definition", { scopeName: nameChain[i], scopeContent: cpp_scope_definition});
				}
				else
				{
					includeGuard += "_HPP";
					includeGuard = includeGuard.toUpperCase();
				}
			}
			
			cppIncludes.push(fileName + ".hpp");
			
			// TODO: includes
			var cppIncludeList = "";
			for(var i = 0; i < cppIncludes.length; ++i)
			{
				cppIncludeList += 'include "' + cppIncludes[i] + '"';
			}
			
			var hpp_file_for_scope = TemplateManager.fetch("CPP_Spidermonkey/hpp_file_for_scope", {includeGuard: includeGuard, scopeDefinition: hpp_scope_definition});
			files[fileName + ".hpp"] = hpp_file_for_scope;
			
			var cpp_file_for_scope = TemplateManager.fetch("CPP_Spidermonkey/cpp_file_for_scope", {includes: cppIncludeList, scopeDefinition: cpp_scope_definition});
			files[fileName + ".cpp"] = cpp_file_for_scope;
			
			return { isInline: false,
			         files: files};
		}
	},
	
	/**
	 * Returns the chain of parent names as an array
	 * TODO: performance? cache?
	 * 
	 * @returns {Array}   Array of parents names
	 */
	getNameChain: function getNameChain()
	{
		var result = [];
		
		var currObj = this.exportObject;
		while(currObj)
		{
			result.push(currObj.name);
			currObj = currObj.parent;
		}
		
		result.reverse();
		
		return result;
	}, 
	
};

TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/function");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/function_define");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_boolean");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_int");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_uint");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_float");

TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_void");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_boolean");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_int");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_float");

TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/scope_definition");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/hpp_file_for_scope");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/hpp_scope_content_class");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/hpp_scope_content_init");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/cpp_file_for_scope");
TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/cpp_scope_content");
//log();