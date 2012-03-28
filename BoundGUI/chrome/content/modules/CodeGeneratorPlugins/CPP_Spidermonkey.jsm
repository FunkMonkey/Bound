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

//======================================================================================

var regexJSIdentifier = /^[$A-Z_][0-9A-Z_$]*$/i;

/**
 * Checks a given string, if it is a valid JavaScript identifier
 * 
 * @param   {string}   identifier   Identifier to check
 * 
 * @returns {boolean}   True if valid, otherwise false
 */
function isValidIdentifier(identifier)
{
	return regexJSIdentifier.test(identifier);
}

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
			case "Property":	   codegen = CPPSM_CodeGenProperty; break;
			default: return null;
		}
		
		return (codegen.isCompatible(astObject, exportParent)) ? codegen : null;
	},
	
	/**
	 * Checks if the given ASTObject is compatible with the plugin
	 * 
	 * @param   {ASTObject|ASTOverloadContainer}   obj            ASTObject to check compatibility for
	 * @param   {Export_ASTObject}                 exportParent   The export parent
	 * 
	 * @returns {boolean}   True if compatible, otherwise false
	 */
	_isCompatible: function _isCompatible(astObject, exportParent)
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
		
		if(!exportParent)
			return false;
		
		var parentCodeGen = exportParent.getCodeGenerator(CPPSM_Plugin.prototype.context);
		
		if(!parentCodeGen || !(parentCodeGen instanceof CPPSM_CodeGenObject))
			return false;
		
		return true;
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


//======================================================================================

/**
 * Code generator for functions and member functions
 *
 * @constructor
 * @extends LanguageBindingEntityCodeGen
 *
 * @property   {string}    templateFunction   Name of the template for the function
 * @property   {boolean}   isStatic           Will function be wrapped as static
 *
 * @param   {CPPSM_Plugin}   plugin   Plugin this code gen belongs to
 */
function CPPSM_CodeGenFunction(plugin)
{
	LanguageBindingEntityCodeGen.call(this, plugin);
	
	this.templateFunction = "CPP_Spidermonkey/function";
}

CPPSM_CodeGenFunction.isCompatible = CPPSM_Plugin.prototype._isCompatible;

CPPSM_CodeGenFunction.prototype = {
	constructor: CPPSM_CodeGenFunction,
		
	get isStatic()
	{
		return (this.exportObject.sourceObject.isStatic == true);
	},
	
	_diagnosisReports: {
		"NoSourceObject": {
			name: "NoSourceObject",
			message: "Export_ASTObject does not have a source ASTObject",
			type: "ERROR"
		}
	},
	
	/**
	 * Prepares the content for code generation and saves it in this._genInput.
	 * This happens in multiple rounds (what only makes sense when being recursive).
	 * Saves problems in this._genInput.diagnosis
	 *    - returns if the code generator will produce valid results
	 *
	 * @param   {number}    round     Round of preparation
	 * @param   {boolean}   recurse   Prepare and diagnose recursively
	 * 
	 * @returns {boolean}   True if valid, otherwise false
	 */
	prepareAndDiagnoseRound: function prepareAndDiagnoseRound(round, recurse)
	{
		switch(round)
		{
			// Round 2: currently there is no other round, we are in 2 because we may need typelib information
			case 2:
				
				try
				{
				
					// clean previous data
					var genInput = this._genInput = { codeGen: this };
					var diagnosis = this._genInput.diagnosis = new CodeGenDiagnosis();
					
					genInput.template = this._getTemplate(this.templateFunction, diagnosis);
					
					// checking the name
					genInput.name = this.exportObject.name;
					if(!isValidIdentifier(genInput.name))
						diagnosis.addReport({ name: "InvalidIdentifier", message: "The given identifier is not valid", type: "ERROR"});
					
					
					// checking the sourceObject
					var astFunc = this.exportObject.sourceObject
					if(!astFunc)
					{
						diagnosis.addReport(this._diagnosisReports["NoSourceObject"]);
					}
					else if(!(astFunc instanceof CPP_ASTObject_Function))
					{
						diagnosis.addReport({ name: "WrongASTObject", message: "ASTObject is not a function", type: "ERROR"});
					}
					else
					{
						genInput.isStatic = this.isStatic;
						
						// check member function specific stuff
						if(astFunc instanceof CPP_ASTObject_Member_Function && !genInput.isStatic)
						{
							if(this.exportObject.parent.sourceObject instanceof CPP_ASTObject_Struct)
							{
								if(!this.exportObject.parent.sourceObject.hasMember(astFunc))
									diagnosis.addReport({ name: "WrongParent", message: "Parent export object wraps other class", type: "ERROR"});
							}
							else
								diagnosis.addReport({ name: "ParentNotClass", message: "Parent export object is not a class", type: "ERROR"});
						}
						
						
						
						// TODO: check parent for member functions
						
						// checking params
						//genInput.numParams = astFunc.parameters.length;
						genInput.params = [];
						
						for(var i = 0; i < astFunc.parameters.length; ++i)
						{
							var param = astFunc.parameters[i];
							var tInfoParam = this.getTypeHandlingTemplate(param.type, LanguageBindingEntityCodeGen.TYPE_FROM_SCRIPT);
							
							var paramInput = {
								name: "p" + i + "__" + param.name,
								templateInfo: tInfoParam
							}
							
							if(tInfoParam)
							{
								paramInput.template = this._getTemplate(tInfoParam.templateName, diagnosis);
								
								// check restrictions
								if(tInfoParam.typeLib && !tInfoParam.typeLib.allowUnwrapping)
									diagnosis.addReport({ name: "ParamTypeRestriction", message: "Parameter type does not allow unwrapping: " + param.name, type: "ERROR"});
							}
							else
								diagnosis.addReport({ name: "ResolvingParamTemplate", message: "Could not resolve parameter template: "  + normalTypePrinter.getAsString(param.type) + " " + param.name, type: "ERROR"});
							
							genInput.params.push(paramInput);
						}
						
						// checking return type
						genInput.returnType = {}
						var tInfoReturn = this.getTypeHandlingTemplate(astFunc.returnType, LanguageBindingEntityCodeGen.TYPE_TO_SCRIPT);
						if(tInfoReturn)
						{
							genInput.returnType.templateInfo = tInfoReturn;
							genInput.returnType.template = this._getTemplate(tInfoReturn.templateName, diagnosis);
							
							// check restrictions
							if(tInfoReturn.typeLib)
							{
								var canonicalType = tInfoReturn.astType.getCanonicalType();
								if(canonicalType.declaration)
								{
									if(!tInfoReturn.typeLib.allowWrappingCopies)
										diagnosis.addReport({ name: "ReturnTypeRestriction", message: "Return type does not allow wrapping copies", type: "ERROR"});
								}
								else if(canonicalType.pointsTo)
								{
									if(!tInfoReturn.typeLib.allowWrappingInstances)
										diagnosis.addReport({ name: "ReturnTypeRestriction", message: "Return type does not allow wrapping instances", type: "ERROR"});
								}
							}
						}
						else
							diagnosis.addReport({ name: "ResolvingReturnTemplate", message: "Could not resolve return type template: " + normalTypePrinter.getAsString(astFunc.returnType), type: "ERROR"});
						
						genInput.returnType.isVoid = (astFunc.returnType.kind === "Void");
						
						// instance call
						genInput.isInstanceCall = (astFunc.kind === ASTObject.KIND_MEMBER_FUNCTION && !astFunc.isStatic);
						genInput.parentQualifier = astFunc.parent.cppLongName;
						genInput.cppFuncionName = astFunc.name;
						
						// include resolution
						genInput.includeFile = this._getSourceObjectIncludeDirective(diagnosis);
					}
				}
				catch(e)
				{
					if(typeof e === "object" && e)
						diagnosis.addReport({ name: "UnexpectedError", message: e.message + "\n\n" + e.stack, type: "ERROR"});
					else
						diagnosis.addReport({ name: "UnexpectedError", message: e, type: "ERROR"});
				}
				
				return !diagnosis.hasErrors;
		}
		
		return true;
	}, 
	
	/**
	 * Generates wrapper code for the connected function
	 * 
	 * @returns {Object}   Wrapper code for the different places
	 */
	generate: function generate()
	{
		// keeps track of used templates
		var templateUser = new TemplateUser();
		
		var genInput = this._genInput;
		
		// setting up the result object
		var result = {
			codeGen: this,
			type: "Function",
			isStatic: genInput.isStatic,
			numParams: genInput.params.length,
			name: genInput.name,
			wrapperFunction: {
				code: "",
				name: "wrapper_" + genInput.name // todo: retrieve from function template
			},
			includeFiles: null
		};
		
		// the main template for the function
		var tFunction = genInput.template;
		
		// parameters
		var params = [];
		for(var i = 0; i < genInput.params.length; ++i)
		{
			var param = genInput.params[i];
			param.templateInfo.declareResultVar = true;
			param.templateInfo.finishStatement = true;
			param.templateInfo.input_jsval = tFunction.getParameter(i);
			param.templateInfo.resultVarName = param.name;
			
			params.push( { initCode: templateUser.fetch(param.template, param.templateInfo),
			               name: param.name});
		}
		
		// return type
		genInput.returnType.templateInfo.finishStatement = true;		
		genInput.returnType.templateInfo.jsvalName = tFunction.getReturnJSVAL();
		genInput.returnType.templateInfo.inputVar = tFunction.getCPPReturnValue();
		var returnTypeCode = templateUser.fetch(genInput.returnType.template, genInput.returnType.templateInfo);
		
		// create the function code
		var cppTypeStr = (genInput.returnType.isVoid) ? "" : normalTypePrinter.getAsString(genInput.returnType.templateInfo.astType);
		var funcData = {
			isInstanceCall: genInput.isInstanceCall,
			params: params,
			returnType: {
				code: returnTypeCode,
				cppTypeStr:  cppTypeStr,
				astType: genInput.returnType.templateInfo.astType},
			parentQualifier: genInput.parentQualifier,
			wrapperFunctionName: result.wrapperFunction.name,
			cppFuncionName: genInput.cppFuncionName,
			codeGen: this
		};
		
		result.wrapperFunction.code = templateUser.fetch(tFunction, funcData);
		
		// include resolution
		var tmpIncludeFiles = templateUser.aggregateIncludes();
		tmpIncludeFiles[genInput.includeFile] = genInput.includeFile;
		
		result.includeFiles = Object.keys(tmpIncludeFiles);
		
		return result;
	},
	
	/**
	 * Returns the generator as a JSON compatible savable object
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
};

Extension.inherit(CPPSM_CodeGenFunction, LanguageBindingEntityCodeGen);

/**
 * Creates the code generator from the given save object
 * 
 * @param   {Object}                    saveObj        Save object with data
 * @param   {CPPSM_Plugin}   plugin         The plugin the generator will belong to
 * @param   {Export_ASTObject}          exportASTObj   ASTObject the generator will belong to
 * 
 * @returns {CPPSM_CodeGenFunction}   The created generator
 */
CPPSM_CodeGenFunction.createFromSaveObject =  function createFromSaveObject(saveObj, plugin, exportASTObj)
{
	var result = new CPPSM_CodeGenFunction(plugin);
	return result;
};

//======================================================================================

/**
 * Code generator for value and accessor properties
 *
 * @constructor
 * @extends LanguageBindingEntityCodeGen
 *
 * @property   {boolean}   isStatic    Will property be wrapped as static
 *
 * @param   {CPPSM_Plugin}   plugin   Plugin this code gen belongs to
 */
function CPPSM_CodeGenProperty(plugin)
{
	LanguageBindingEntityCodeGen.call(this, plugin);
}

CPPSM_CodeGenProperty.isCompatible = CPPSM_Plugin.prototype._isCompatible;

CPPSM_CodeGenProperty.prototype = {
	constructor: CPPSM_CodeGenProperty,
	
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
		return {};
	},
	
	/**
	 * Returns the generator as a JSON compatible savable object
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
};

Extension.inherit(CPPSM_CodeGenProperty, LanguageBindingEntityCodeGen);

//======================================================================================

// TODO: split into object and class

/**
 * Code generator for namespaces and classes
 *
 * @constructor
 * @extends LanguageBindingEntityCodeGen
 *
 * @property   {string}   hppTemplateNameClass     Template name for header of class wraps
 * @property   {string}   cppTemplateNameClass     Template name for source of class wraps
 * @property   {string}   hppTemplateNameObject    Template name for header of object wraps
 * @property   {string}   cppTemplateNameObject    Template name for source of object wraps
 * @property   {boolean}  useBasePrototype         If true, the wrapper will check for prototypes
 * @property   {string}   ownership                Classes only: memory ownership
 * @property   {boolean}  allowWrappingInstances   Classes only: allow wrapping instances?
 * @property   {boolean}  allowWrappingCopies      Classes only: allow wrapping copies?
 * @property   {boolean}  allowUnwrapping          Classes only: allow unwrapping of JSObjects?
 * @property   {boolean}  allowNullValues          Classes only: allow wrapping wrapping of NULL values?
 * @property   {boolean}  allowConstruction        Classes only: allow constructing new JSObjects?
 * @property   {boolean}  isInline                 Shall the source code get its own file or not?
 * @property   {ASTTypeLibraryEntry}   _typeLibraryEntry   Type libray entry created for this class
 *
 * @param   {CPPSM_Plugin}   plugin   Plugin this code gen belongs to
 */
function CPPSM_CodeGenObject(plugin)
{
	LanguageBindingEntityCodeGen.call(this, plugin);
	
	this.hppTemplateNameClass = "CPP_Spidermonkey/hpp_scope_content_class";
	this.cppTemplateNameClass = "CPP_Spidermonkey/cpp_scope_content_class";
	this.hppTemplateNameObject = "CPP_Spidermonkey/hpp_scope_content_object";
	this.cppTemplateNameObject = "CPP_Spidermonkey/cpp_scope_content_object";
	
	this.useBasePrototype = true;
	
	this.ownership = "Script";
	this.allowWrappingInstances = false;
	this.allowWrappingCopies = false;
	this.allowUnwrapping = true;
	this.allowNullValues = false;
	this.allowConstruction = true;
	
	this._typeLibraryEntry = null;
}

CPPSM_CodeGenObject.isCompatible = CPPSM_Plugin.prototype._isCompatible;

CPPSM_CodeGenObject.prototype = {
	constructor: CPPSM_CodeGenObject,
	
	// TODO: can we remove this?
	get exportObject(){ return this._exportObject; },
	set exportObject(val) {this._exportObject = val; },
	
	/**
	 * Removes the type library entry from the plugin
	 */
	_removeTypeLibraryEntry: function _removeTypeLibraryEntry()
	{
		if(this._typeLibraryEntry)
		{
			var entry = this.plugin.getTypeLibraryEntry(this._typeLibraryEntry.id);
			if(entry)
			{
				if(entry !== this._typeLibraryEntry)
					throw new Error("Trying to remove type library entry created by different codegen");
					
				this.plugin.removeTypeLibraryEntry(this._typeLibraryEntry.id);
				this._typeLibraryEntry = null;
			}
			else
			{
				// TODO: that should not be possible
			}
		}
	}, 
	
	/**
	 * Updates the entry in the plugin's type library
	 *
	 * @param   {Template}   template    Template to receive information from
	 */
	_updateTypeLibraryEntry: function _updateTypeLibraryEntry(template)
	{
		if(this._typeLibraryEntry)
			this._removeTypeLibraryEntry();
		
		var sourceObject = this.exportObject.sourceObject;
		
		
		// only C++ structs and classes need a type library entry
		if(sourceObject &&  ((sourceObject instanceof CPP_ASTObject_Struct || sourceObject instanceof CPP_ASTObject_Class)))
		{
			this._typeLibraryEntry = new ASTTypeLibraryEntry(sourceObject.USR);
			this._typeLibraryEntry.ownership = this.ownership;
			this._typeLibraryEntry.allowWrappingInstances = this.allowWrappingInstances;
			this._typeLibraryEntry.allowWrappingCopies = this.allowWrappingCopies;
			this._typeLibraryEntry.allowUnwrapping = this.allowUnwrapping;
			this._typeLibraryEntry.allowNullValues = this.allowNullValues;
			this._typeLibraryEntry.allowConstruction = this.allowConstruction;
			this._typeLibraryEntry.cppClassFullName = sourceObject.cppLongName;
			
			if(template)
			{
				// assuming we are in genInput
				var typeInfoFromTemplate = template.getTypeLibraryInfo(this._genInput);
				this._typeLibraryEntry.unwrapFunction       = typeInfoFromTemplate.unwrapFunction;
				this._typeLibraryEntry.wrapInstanceFunction = typeInfoFromTemplate.wrapInstanceFunction;
				this._typeLibraryEntry.wrapCopyFunction     = typeInfoFromTemplate.wrapCopyFunction;
				this._typeLibraryEntry.jsClass              = typeInfoFromTemplate.jsClass;
				this._typeLibraryEntry.jsPrototype          = typeInfoFromTemplate.jsPrototype;
				this._typeLibraryEntry.jsConstructor        = typeInfoFromTemplate.jsConstructor;
				
				// TODO: customize file ending
				// TODO: add project_dir
				this._typeLibraryEntry.includeFile = this._getFileName() + ".hpp"; 
			}
			
			
			this.plugin.addTypeLibraryEntry(this._typeLibraryEntry.id, this._typeLibraryEntry);
		}
	},
		
	get isInline()
	{
		return (this.exportObject.children.length === 0) && (this.exportObject.parent !== null);
	},
	
	/**
	 * Returns the filename (without extension)
	 * 
	 * @returns {string}   Filename
	 */
	_getFileName: function _getFileName()
	{
		var fileName = "";
		var obj = this.exportObject;
		while(obj)
		{
			var codeGen = obj.getCodeGenerator(this.context);
			if(codeGen && !codeGen.isInline)
				fileName = ((obj.parent == null) ? "" : "/") + obj.name + fileName;
			
			obj = obj.parent
		}
		
		return fileName;
	}, 
	
	
	
	/**
	 * Prepares the content for code generation and saves it in this._genInput.
	 * This happens in multiple rounds (what only makes sense when being recursive).
	 * Saves problems in this._genInput.diagnosis
	 *    - returns if the code generator will produce valid results
	 *
	 * @param   {number}    round     Round of preparation
	 * @param   {boolean}   recurse   Prepare and diagnose recursively
	 * 
	 * @returns {boolean}   True if valid, otherwise false
	 */
	prepareAndDiagnoseRound: function prepareAndDiagnoseRound(round, recurse)
	{
		switch(round)
		{
			// Round 1: currently there is no other round
			case 1:
				try
				{
					// clean previous data
					var genInput = this._genInput = { codeGen: this };
					var diagnosis = this._genInput.diagnosis = new CodeGenDiagnosis();
					
					var scopeObj = this.exportObject;
					var sourceObj = this.exportObject.sourceObject;
					
					genInput.name = scopeObj.name;
					if(!isValidIdentifier(genInput.name))
						diagnosis.addReport({ name: "InvalidIdentifier", message: "The given identifier is not valid", type: "ERROR"});
					
					// TODO: check parent
					
					// the other stuff
					genInput.isInline = this.isInline;
					genInput.nameChain = this.getNameChain();
					genInput.defineOnParent = (scopeObj.parent == null);
					
					if(sourceObj && (sourceObj.kind === ASTObject.KIND_STRUCT || sourceObj.kind === ASTObject.KIND_CLASS))
					{
						genInput.type = "Class";
						genInput.hppTemplate = this._getTemplate(this.hppTemplateNameClass, diagnosis);
						genInput.cppTemplate = this._getTemplate(this.cppTemplateNameClass, diagnosis);
						genInput.cppClassFullName = sourceObj.cppLongName;
						
						// validating type library
						this._updateTypeLibraryEntry(genInput.hppTemplate);
						if(this._typeLibraryEntry.ownership === "Script")
						{
							if(this._typeLibraryEntry.allowWrappingInstances)
								diagnosis.addReport({ name: "IncompatibleOptions", message: "allowWrappingInstances and ownership 'Script' are incompatible, as they will result in undefined behaviour when rewrapping", type: "ERROR"});
						}
						else if(this._typeLibraryEntry.ownership === "Native")
						{
							if(this._typeLibraryEntry.allowWrappingCopies)
								diagnosis.addReport({ name: "IncompatibleOptions", message: "allowWrappingCopies and ownership 'Native' are incompatible, as they will likely result in memory leaks.", type: "ERROR"});
						}
						genInput.typeLib = this._typeLibraryEntry;
						genInput.includeFile = this._getSourceObjectIncludeDirective(diagnosis);
						
						if(this.useBasePrototype)
						{
							var baseTypeLibs = this.getBaseTypeLibraryEntries(sourceObj);
							if(baseTypeLibs.length > 0)
							{
								genInput.baseTypeLib = baseTypeLibs[0];
							}
						}
					}
					else
					{
						genInput.type = "Object";
						genInput.hppTemplate = this._getTemplate(this.hppTemplateNameObject, diagnosis);
						genInput.cppTemplate = this._getTemplate(this.cppTemplateNameObject, diagnosis);
					}
				}
				catch(e)
				{
					if(typeof e === "object" && e)
						diagnosis.addReport({ name: "UnexpectedError", message: e.message + "\n\n" + e.stack, type: "ERROR"});
					else
						diagnosis.addReport({ name: "UnexpectedError", message: e, type: "ERROR"});
				}
		}
		
		if(recurse)
			return !this._genInput.diagnosis.hasErrors && this.prepareAndDiagnoseRoundChildren(round, recurse);
		else
			return !this._genInput.diagnosis.hasErrors;
	},
	
	/**
	 * Generates wrapper code for the connected function
	 * 
	 * @returns {Object}   Wrapper code for the different places
	 */
	generate: function generate()
	{
		// keeps track of used templates
		var hppTemplateUser = new TemplateUser();
		var cppTemplateUser = new TemplateUser();
		
		var genInput = this._genInput;
		
		var result = {
			codeGen: this,
			type: genInput.type,
			isInline: genInput.isInline,
			hppIncludes: null,
			cppIncludes: null,
			children: [],
			wrapper: {
				hppCode: "",
				cppCode: "",
				name: genInput.name
			}
		};
				
		// adding children recursively
		var scopeObj = this.exportObject;
		for(var i = 0; i < scopeObj.children.length; ++i)
		{
			var child = scopeObj.children[i];
			var childCodeGen = child.getCodeGenerator(this.context);
			if(childCodeGen)
			{
				var childResult = childCodeGen.generate();
				result.children.push(childResult);
			}
		}
				
		// code creation
		var templateData = {
			codeGen: this,
			children: result.children,
			nameChain: genInput.nameChain,
			defineOnParent: genInput.defineOnParent,
			typeLib: genInput.typeLib,
			baseTypeLib: genInput.baseTypeLib,
			cppClassFullName: genInput.cppClassFullName
		}
		
		// ------ hpp ------
		result.wrapper.hppCode = hppTemplateUser.fetch(genInput.hppTemplate, templateData);
		result.hppIncludes = Object.keys(hppTemplateUser.aggregateIncludes());
		if(genInput.includeFile)
			result.hppIncludes.push(genInput.includeFile);
		
		// ------ cpp ------
		result.wrapper.cppCode = cppTemplateUser.fetch(genInput.cppTemplate, templateData);
		result.cppIncludes = Object.keys(cppTemplateUser.aggregateIncludes());
		
		// ----- result -----
		return result;
	},
	
	/**
	 * Returns the chain of parent names as an array
	 * TODO: performance? cache?
	 * 
	 * @returns {string[]}   Array of parents names
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
	
	/**
	 * Returns the generator as a JSON compatible savable object
	 * 
	 * @returns {Object}   Object that contains savable data
	 */
	toSaveObject: function toSaveObject()
	{
		var result = {};
		LoadSaveFromMetaData.saveTo(result, this);
		return result;
	},
	
	/**
	* Loads from the given JSON-compatible save-object
	* 
	* @param   {Object}     saveObj        Save object with data
	*/
	loadFromSaveObject: function loadFromSaveObject(saveObj)
	{
		LoadSaveFromMetaData.loadFrom(this, saveObj);
	},
	
};

Extension.inherit(CPPSM_CodeGenObject, LanguageBindingEntityCodeGen);

MetaData.initMetaDataOn(CPPSM_CodeGenObject.prototype)
   .addPropertyData("_typeLibraryEntry", { type: "KeyValueMap", view: {}})
   .addPropertyData("_genInput", {type: "KeyValueMap", view: {}})
   .addPropertyData("hppTemplateNameClass", {view: {}, load_save: {}})
   .addPropertyData("cppTemplateNameClass", {view: {}, load_save: {}})
   .addPropertyData("hppTemplateNameObject", {view: {}, load_save: {}})
   .addPropertyData("cppTemplateNameObject", {view: {}, load_save: {}})
   .addPropertyData("useBasePrototype", {view: {}, load_save: {}})
   .addPropertyData("ownership", {type: "dropdown", view: {dropDownValues:{"Script": "Script", "Native": "Native"}}, load_save: {}})
   .addPropertyData("allowWrappingInstances", {view: {}, load_save: {}})
   .addPropertyData("allowWrappingCopies", {view: {}, load_save: {}})
   .addPropertyData("allowUnwrapping", {view: {}, load_save: {}})
   .addPropertyData("allowNullValues", {view: {}, load_save: {}})
   .addPropertyData("allowConstruction", {view: {}, load_save: {}})
