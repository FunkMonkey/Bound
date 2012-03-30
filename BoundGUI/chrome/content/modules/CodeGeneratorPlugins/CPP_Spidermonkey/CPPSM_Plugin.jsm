/*global Components, CPP_ASTObject, CodeGeneratorPluginManager, TemplateManager */

var EXPORTED_SYMBOLS = ["CPPSM_Plugin"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/LanguageBindingPlugin.jsm");

Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");

Components.utils.import("chrome://bound/content/modules/Templates/TemplateManager.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CodeGeneratorPluginManager.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/LoadSaveFromMetaData.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/ObjectHelpers.jsm");

Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey/CPPSM_CodeGenFunction.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey/CPPSM_CodeGenProperty.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey/CPPSM_CodeGenObject.jsm");

//======================================================================================

/**
 * Represents a plugin for creating glue code for SpiderMonkey
 *
 * @constructor
 * @extends LanguageBindingCodeGenPlugin
 */
function CPPSM_Plugin()
{
	LanguageBindingCodeGenPlugin.call(this);
	
	this.AST = null;
}

CPPSM_Plugin.prototype = {
	constructor: CPPSM_Plugin,
	
	context: "CPP_Spidermonkey",
	
	typeTemplates_to_script: {
		"bool":                "CPP_Spidermonkey/bool_to_jsval",
		"char":                "CPP_Spidermonkey/int_to_jsval", // ???
		"unsigned char":       "CPP_Spidermonkey/int_to_jsval",
		"char16_t":            "CPP_Spidermonkey/int_to_jsval",
		"char32_t":            "CPP_Spidermonkey/int_to_jsval",
		"unsigned short":      "CPP_Spidermonkey/int_to_jsval",
		"unsigned int":        "CPP_Spidermonkey/int_to_jsval",
		"unsigned long":       "CPP_Spidermonkey/int_to_jsval",
		"unsigned long long":  "CPP_Spidermonkey/int_to_jsval",
		"unsigned __int128":   "CPP_Spidermonkey/int_to_jsval",
		"signed char":         "CPP_Spidermonkey/int_to_jsval",
		"wchar_t":             "CPP_Spidermonkey/int_to_jsval", // TODO: may change
		"short":               "CPP_Spidermonkey/int_to_jsval",
		"int":                 "CPP_Spidermonkey/int_to_jsval",
		"long":                "CPP_Spidermonkey/int_to_jsval",
		"long long":           "CPP_Spidermonkey/int_to_jsval",
		"__int128":            "CPP_Spidermonkey/int_to_jsval",
		"float":               "CPP_Spidermonkey/float_to_jsval",
		"double":              "CPP_Spidermonkey/float_to_jsval",
		"long double":         "CPP_Spidermonkey/float_to_jsval",
		
		"const char *":           "CPP_Spidermonkey/const_char_array_to_jsval",
		"char *":                 "CPP_Spidermonkey/const_char_array_to_jsval",
		"::std::string":          "CPP_Spidermonkey/std_string_to_jsval",
		"const ::std::string *":  "CPP_Spidermonkey/std_string_to_jsval",
		"const ::std::string &":  "CPP_Spidermonkey/std_string_to_jsval",
		"::std::string *":        "CPP_Spidermonkey/std_string_to_jsval",
		"::std::string &":        "CPP_Spidermonkey/std_string_to_jsval",
		
		"void":                "CPP_Spidermonkey/void_to_jsval"
	},
	
	typeTemplates_from_script: {
		"bool":                "CPP_Spidermonkey/jsval_to_bool",
		"char":                "CPP_Spidermonkey/jsval_to_int", // ???
		"unsigned char":       "CPP_Spidermonkey/jsval_to_uint",
		"char16_t":            "CPP_Spidermonkey/jsval_to_int",
		"char32_t":            "CPP_Spidermonkey/jsval_to_int",
		"unsigned short":      "CPP_Spidermonkey/jsval_to_uint",
		"unsigned int":        "CPP_Spidermonkey/jsval_to_uint",
		"unsigned long":       "CPP_Spidermonkey/jsval_to_uint",
		"unsigned long long":  "CPP_Spidermonkey/jsval_to_uint",
		"unsigned __int128":   "CPP_Spidermonkey/jsval_to_uint",
		"signed char":         "CPP_Spidermonkey/jsval_to_int",
		"wchar_t":             "CPP_Spidermonkey/jsval_to_int", // TODO: may change
		"short":               "CPP_Spidermonkey/jsval_to_int",
		"int":                 "CPP_Spidermonkey/jsval_to_int",
		"long":                "CPP_Spidermonkey/jsval_to_int",
		"long long":           "CPP_Spidermonkey/jsval_to_int",
		"__int128":            "CPP_Spidermonkey/jsval_to_int",
		"float":               "CPP_Spidermonkey/jsval_to_float",
		"double":              "CPP_Spidermonkey/jsval_to_float",
		"long double":         "CPP_Spidermonkey/jsval_to_float",
		
		"const char *":           "CPP_Spidermonkey/jsval_to_const_char_array",
		"char *":                 "CPP_Spidermonkey/jsval_to_const_char_array",
		"::std::string":          "CPP_Spidermonkey/jsval_to_std_string",
		"const ::std::string *":  "CPP_Spidermonkey/jsval_to_std_string",
		"const ::std::string &":  "CPP_Spidermonkey/jsval_to_std_string",
		"::std::string *":        "CPP_Spidermonkey/jsval_to_std_string",
		"::std::string &":        "CPP_Spidermonkey/jsval_to_std_string",
	},
	
	/**
	 * Number of times prepareAndDiagnose will be called
	 * @type number
	 */
	numPrepareRounds: 2,
	
	/**
	 * Returns a code generator that is compatible with the given ASTObject
	 * 
	 * @param   {ASTObject|ASTOverloadContainer}          astObject      ASTObject to find codegen for
     * @param   {Export_ASTObject}                        exportParent   The export parent
	 * 
	 * @returns {CodeGenerator}   Codegenerator that is compatible, or null
	 */
	getCodeGeneratorByASTObject: function getCodeGeneratorByASTObject(astObject, exportParent)
	{
		if(!astObject)
			return CPPSM_CodeGenObject; // TODO: is this a good idea?
		
		if(!astObject.getKindAsString)
			return null;
		
		var kind = astObject.getKindAsString();
		
		var codegen;
		switch(kind)
		{
			case "Function":       codegen = CPPSM_CodeGenFunction; break;
			case "MemberFunction": codegen = CPPSM_CodeGenFunction; break;
			case "Namespace":
			case "Class":
			case "Struct":         codegen = CPPSM_CodeGenObject; break;
			case "Field":
			case "Property":	   codegen = CPPSM_CodeGenProperty; break;
			default: return null;
		}
		
		return (codegen.isCompatible(astObject, exportParent)) ? codegen : null;
	},
	
	/**
	 * Returns the plugin as a JSON compatible savable object
	 * 
	 * @returns {Object}   Object that contains savable data
	 */
	toSaveObject: function toSaveObject()
	{
		return {};
	},
	
	/**
	* Loads from the given JSON-compatible save-object
	* 
	* @param   {Object}     saveObj        Save object with data
	*/
	loadFromSaveObject: function loadFromSaveObject(saveObj)
	{
	},
	
	/**
	 * Creates a code generator from the given save object
	 * 
	 * @param   {Object}             saveObj        Save object with data
	 * @param   {Export_ASTObject}   exportASTObj   ASTObject the generator will belong to
	 * 
	 * @returns {LanguageBindingEntityCodeGen}   The created generator
	 */
	createCodeGeneratorFromSaveObject: function createCodeGeneratorFromSaveObject(saveObj, exportASTObj)
	{
		var CodeGenConstructor = this.getCodeGeneratorByASTObject(exportASTObj.sourceObject, exportASTObj.parent);
		var codeGen = new CodeGenConstructor(this);
		codeGen.loadFromSaveObject(saveObj);
		
		return codeGen;
	}, 
	
	/**
	 * Returns the files available for export for the given code generator result (must be "Class" or "Object")
	 * 
	 * @param   {Object}   codeGenResult   codeGenResult to export
	 * 
	 * @returns {Object}   Object with filenames and content
	 */
	getExportFiles: function getExportFiles(codeGenResult)
	{
		if(codeGenResult.type !== "Object" && codeGenResult.type !== "Class")
			throw new Error("Can only export code generator results of type 'Object' or 'Class'");
		
		var result = this._exportCodeGen(codeGenResult, "");
		var files = {};
		
		for(var fileName in result.hppFiles)
			files["include/" + fileName] = result.hppFiles[fileName];
			
		for(var fileName in result.cppFiles)
			files["src/" + fileName] = result.cppFiles[fileName];
			
		return files;
	},
	
	/**
	 * Exports a code generator result recursively
	 *
	 * @param   {Object}   codeGenResult   codeGenResult to export
	 * @param   {string}   parentPath      Path of the parent
	 * 
	 * @returns {Object}   Information exported from this code generator
	 */
	_exportCodeGen: function _exportCodeGen(codeGenResult, parentPath)
	{
		// IMPORTANT: when changing this function, adjust CodeGenerator._updateTypeLibraryEntry()
		//              and CodeGenerator._getFileName() if necessary!!
		
		// current path
		var path = ((parentPath === "") ? "" : (parentPath + "/")) + codeGenResult.wrapper.name;
		
		// gather children
		var result = {
			hppCodes: [],
			cppCodes: [],
			hppIncludes: null,
			cppIncludes: null,
			hppFiles: {},
			cppFiles: {}
		}
		
		var hppIncludes = {};
		var cppIncludes = {};
		
		// get children data
		for(var i = 0, len = codeGenResult.children.length; i < len; ++i)
		{
			var child = codeGenResult.children[i];
			if(child.type === "Class" || child.type === "Object")
			{
				var childResult = this._exportCodeGen(child, path);
				
				if(childResult.isInline)
				{
					result.hppCodes.push.apply(result.hppCodes, childResult.hppCodes);
					result.cppCodes.push.apply(result.cppCodes, childResult.cppCodes);
				}
				
				for(var fileName in childResult.hppFiles)
					result.hppFiles[fileName] = childResult.hppFiles[fileName];
					
				for(var fileName in childResult.cppFiles)
					result.cppFiles[fileName] = childResult.cppFiles[fileName];
				
				// the same file should only be included once, thus we're using a map
				ObjectHelpers.mergeKeys(hppIncludes, childResult.hppIncludes);
				ObjectHelpers.mergeKeys(cppIncludes, childResult.cppIncludes);
			}
			else if(child.includeFiles)
			{
				ObjectHelpers.mergeKeys(cppIncludes, child.includeFiles);
			}
		}
		
		// add the own stuff
		result.hppCodes.push(codeGenResult.wrapper.hppCode);
		result.cppCodes.push(codeGenResult.wrapper.cppCode);
		ObjectHelpers.mergeKeys(hppIncludes, codeGenResult.hppIncludes);
		ObjectHelpers.mergeKeys(cppIncludes, codeGenResult.cppIncludes);
		
		// return appropriate code
		if(parentPath !== "" && codeGenResult.isInline)
		{
			result.isInline = true;
			result.hppIncludes = Object.keys(hppIncludes);
			result.cppIncludes = Object.keys(cppIncludes);
		}
		else
		{
			var hppFileInclude = '#include "' + path + '.hpp"';
			cppIncludes[hppFileInclude] = hppFileInclude;
			
			// cleaning up includes
			hppIncludes = Object.keys(hppIncludes);
			cppIncludes = Object.keys(cppIncludes);
			
			// TODO: remove null's and undefines
			
			// TODO: add correct fetch data for replacement
			for(var i = 0, len = hppIncludes.length; i < len; ++i)
				hppIncludes[i] = new jSmart(hppIncludes[i]).fetch({});
				
			for(var i = 0, len = cppIncludes.length; i < len; ++i)
				cppIncludes[i] = new jSmart(cppIncludes[i]).fetch({});
			
			// create hpp and cpp file
			result.hppFiles[path + ".hpp"] = TemplateManager.getTemplate("CPP_Spidermonkey/hpp_file_for_scope").fetch({path: path, includes: hppIncludes, codes: result.hppCodes});
			result.cppFiles[path + ".cpp"] = TemplateManager.getTemplate("CPP_Spidermonkey/cpp_file_for_scope").fetch({path: path, includes: cppIncludes, codes: result.cppCodes});
			
			// clean up
			result.hppCodes.length = 0;
			result.cppCodes.length = 0;
			result.hppIncludes = [];
			result.cppIncludes = [hppFileInclude];
		}
		
		return result;
	}, 
	
};

Extension.inherit(CPPSM_Plugin, LanguageBindingCodeGenPlugin);

CodeGeneratorPluginManager.registerPlugin(CPPSM_Plugin.prototype.context, CPPSM_Plugin);