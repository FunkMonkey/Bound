/*global Components, CPP_ASTObject, CodeGeneratorPluginManager, TemplateManager */

var EXPORTED_SYMBOLS = ["Plugin_CPP_Spidermonkey"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/ScriptPlugin.jsm");

Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");

Components.utils.import("chrome://bound/content/modules/Templates/TemplateManager.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CodeGeneratorPluginManager.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/LoadSaveFromMetaData.jsm");

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {Plugin_CPP_Spidermonkey}
 */
function Plugin_CPP_Spidermonkey()
{
	ScriptCodeGenPlugin.call(this);
	
	this.AST = null;
}

/**
 * Creates the code generator plugin from the given save object
 * 
 * @param   {Object}                    saveObj        Save object with data
 * 
 * @returns {CodeGenerator}   The created generator
 */
Plugin_CPP_Spidermonkey.createFromSaveObject =  function createFromSaveObject(saveObj)
{
	var result = new Plugin_CPP_Spidermonkey();
	return result;
};

Plugin_CPP_Spidermonkey.prototype = {
	constructor: Plugin_CPP_Spidermonkey,
	
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
		"long double":         "CPP_Spidermonkey/jsval_to_float"
	},
	
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
			return CodeGenerator_Object; // TODO: is this a good idea?
		
		if(!astObject.getKindAsString)
			return null;
		
		var kind = astObject.getKindAsString();
		
		var codegen;
		switch(kind)
		{
			case "Function":       codegen = CodeGenerator_Function; break;
			case "MemberFunction": codegen = CodeGenerator_Function; break;
			case "Namespace":
			case "Class":
			case "Struct":         codegen = CodeGenerator_Object; break;
			case "Property":	   codegen = CodeGenerator_Property; break;
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
		
		var parentCodeGen = exportParent.getCodeGenerator(Plugin_CPP_Spidermonkey.prototype.context);
		
		if(!parentCodeGen || !(parentCodeGen instanceof CodeGenerator_Object))
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
	 * Creates a code generator from the given save object
	 * 
	 * @param   {Object}             saveObj        Save object with data
	 * @param   {Export_ASTObject}   exportASTObj   ASTObject the generator will belong to
	 * 
	 * @returns {CodeGenerator}   The created generator
	 */
	createCodeGeneratorFromSaveObject: function createCodeGeneratorFromSaveObject(saveObj, exportASTObj)
	{
		var codeGen = this.getCodeGeneratorByASTObject(exportASTObj.sourceObject, exportASTObj.parent);
		return codeGen.createFromSaveObject(saveObj, this, exportASTObj);
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

Extension.inherit(Plugin_CPP_Spidermonkey, ScriptCodeGenPlugin);

CodeGeneratorPluginManager.registerPlugin(Plugin_CPP_Spidermonkey.prototype.context, Plugin_CPP_Spidermonkey);

//======================================================================================

/**
 * Returns a template and adds it to the used templates array
 * 
 * @param   {String}   templateName    Name of the template to get
 * @param   {Array}    usedTemplates   Array of used templates
 * 
 * @returns {jSmart}   Template
 */
function getAndUseTemplate(templateName, usedTemplates)
{
	var template = TemplateManager.getTemplate(templateName);
	usedTemplates.push(template);
	
	return template;
}

//======================================================================================

/**
 * Code generator for functions and member functions
 *
 * @constructor
 * @this {CodeGenerator_Function}
 */
function CodeGenerator_Function(plugin)
{
	ScriptCodeGen.call(this, plugin);
	
	this.templateFunction = "CPP_Spidermonkey/function";
}

CodeGenerator_Function.isCompatible = Plugin_CPP_Spidermonkey.prototype._isCompatible;

CodeGenerator_Function.prototype = {
	constructor: CodeGenerator_Function,
		
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
		// keeps track of used templates
		var templateUser = new TemplateUser();
		
		// getting the source object
		var astFunc = this.exportObject.sourceObject;
		
		// setting up the result object
		var result = {
			type: "Function",
			codeGen: this,
			isStatic: this.isStatic,
			numParams: astFunc.parameters.length,
			name: this.exportObject.name,
			wrapperFunction: {
				code: "",
				name: "wrapper_" + this.exportObject.name
			},
			includeFiles: null
		};
		
		// the main template for the function
		var tFunction = templateUser.use(this.templateFunction);
		
		// parameters
		var params = [];
		for(var i = 0; i < astFunc.parameters.length; ++i)
		{
			var param = astFunc.parameters[i];
			var tInfoParam = this.getTypeHandlingTemplate(param, ScriptCodeGen.TYPE_FROM_SCRIPT);
			tInfoParam.declareResultVar = true;
			tInfoParam.finishStatement = true;
			tInfoParam.input_jsval = tFunction.userdata.getParameter(i);
			tInfoParam.resultVarName = "p" + i + "__" + param.name;
			
			params.push( { initCode: templateUser.fetch(tInfoParam.templateName, tInfoParam),
			               name: tInfoParam.resultVarName});
		}
		
		// return type
		var tInfoReturn = this.getTypeHandlingTemplate(astFunc.returnType, ScriptCodeGen.TYPE_TO_SCRIPT);
		tInfoReturn.finishStatement = true;		
		tInfoReturn.jsvalName = tFunction.userdata.getReturnJSVAL();
		tInfoReturn.inputVar = tFunction.userdata.getCPPReturnValue();
		var returnTypeCode = templateUser.fetch(tInfoReturn.templateName, tInfoReturn);
		
		// create the function code
		var parentQualifier = astFunc.parent.cppLongName;
		
		var funcData = {
			isInstanceCall: (astFunc.kind === ASTObject.KIND_MEMBER_FUNCTION && !astFunc.isStatic),
			params: params,
			returnType: {
				code: returnTypeCode,
				cppTypeStr: "" }, // TODO 
			parentQualifier: parentQualifier,
			wrapperFunctionName: result.wrapperFunction.name,
			cppFuncionName: this.exportObject.sourceObject.name
		};
		
		result.wrapperFunction.code = tFunction.fetch(funcData);
		
		// include resolution
		result.includeFiles = templateUser.aggregateIncludes();
		var location = (astFunc.isDefinition == true) ? astFunc.definition : astFunc.declarations[0];
		if(location)
		{
			var fixedPath = location.fileName.replace(astFunc.AST.TUPath, "");
			result.includeFiles.push('#include "{$CPP_TU_DIR}' + fixedPath + '"');
		}
		
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
};

Extension.inherit(CodeGenerator_Function, ScriptCodeGen);

/**
 * Creates the code generator from the given save object
 * 
 * @param   {Object}                    saveObj        Save object with data
 * @param   {Plugin_CPP_Spidermonkey}   plugin         The plugin the generator will belong to
 * @param   {Export_ASTObject}          exportASTObj   ASTObject the generator will belong to
 * 
 * @returns {CodeGenerator}   The created generator
 */
CodeGenerator_Function.createFromSaveObject =  function createFromSaveObject(saveObj, plugin, exportASTObj)
{
	var result = new CodeGenerator_Function(plugin);
	return result;
};

//======================================================================================

/**
 * Code generator for functions and member functions
 *
 * @constructor
 * @this {CodeGenerator_Function}
 */
function CodeGenerator_Property(plugin)
{
	ScriptCodeGen.call(this, plugin);
}

CodeGenerator_Property.isCompatible = Plugin_CPP_Spidermonkey.prototype._isCompatible;

CodeGenerator_Property.prototype = {
	constructor: CodeGenerator_Property,
	
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
};

Extension.inherit(CodeGenerator_Property, ScriptCodeGen);

//======================================================================================



function eliminateDuplicates(arr) {
  var i,
      len=arr.length,
      out=[],
      obj={};

  for (i=0;i<len;i++) {
    obj[arr[i]]=0;
  }
  for (i in obj) {
    out.push(i);
  }
  return out;
}


/**
 * Code generator for objects
 *
 * @constructor
 * @this {CodeGenerator_Object}
 */
function CodeGenerator_Object(plugin)
{
	ScriptCodeGen.call(this, plugin);
	
	this.hppTemplate = "You fool made it!";
	
	this._typeLibraryEntry = null;
}

CodeGenerator_Object.isCompatible = Plugin_CPP_Spidermonkey.prototype._isCompatible;




CodeGenerator_Object.prototype = {
	constructor: CodeGenerator_Object,
	
	get exportObject(){ return this._exportObject; },
	set exportObject(val) {this._exportObject = val; this._updateTypeLibraryEntry(); },
	
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
	 */
	_updateTypeLibraryEntry: function _updateTypeLibraryEntry()
	{
		if(this._typeLibraryEntry)
			this._removeTypeLibraryEntry();
		
		var astObject = this.exportObject.astObject;
		
		// only C++ structs and classes need a type library entry
		if(astObject &&  ((astObject instanceof CPP_ASTObject_Struct || astObject instanceof CPP_ASTObject_Class)))
		{
			this._typeLibraryEntry = new ASTTypeLibraryEntry(astObject.USR);
			
			// TODO: more info
			this.plugin.addTypeLibraryEntry(this._typeLibraryEntry.id, this._typeLibraryEntry);
		}
	}, 
	
	
	/**
	 * Generates wrapper code for the connected function
	 * 
	 * @returns {Object}   Wrapper code for the different places
	 */
	generate: function generate()
	{
		var usedTemplates = [];
		
		var scopeObj = this.exportObject;
		var sourceObj = this.exportObject.sourceObject;
		
		var isInline = (scopeObj.children.length === 0) && (scopeObj.parent !== null);
		var nameChain = this.getNameChain();
		
		// ------ children ------
		
		var hppIncludes = [];
		var cppIncludes = [];
		var files = {};
		
		var childScopes = [];
		var nonScopeElements = [];
		var childFunctions = [];
		
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
					childScopes.push(childCode);
					
					if(childCode.isInline)
					{
						cppIncludes.push.apply(cppIncludes, childCode.cppIncludes);
					}
					else
					{
						cppIncludes.push('#include "' + childCode.hppFileName + '"');
						for(var file in childCode.files)
							files[file] = childCode.files[file];
					}
				}
				else if(childCodeGen instanceof CodeGenerator_Function)
				{
					nonScopeElements.push(childCode);
					cppIncludes.push.apply(cppIncludes, childCode.includeFiles);
					
					childFunctions.push(childCode);
				}
			}
		}
		
		var tHPPTemplate = null;
		var tCPPTemplate = null;
		
		if(sourceObj && (sourceObj.kind === ASTObject.KIND_STRUCT || sourceObj.kind === ASTObject.KIND_CLASS))
		{
			// ------ classes only ------
			tHPPTemplate = getAndUseTemplate("CPP_Spidermonkey/hpp_scope_content_class", usedTemplates);
			tCPPTemplate = getAndUseTemplate("CPP_Spidermonkey/cpp_scope_content_class", usedTemplates);
			var fullName = sourceObj.cppLongName;
		}
		else
		{
			// ------ namespaces only ------
			tHPPTemplate = getAndUseTemplate("CPP_Spidermonkey/hpp_scope_content_init", usedTemplates);
			tCPPTemplate = getAndUseTemplate("CPP_Spidermonkey/cpp_scope_content_object", usedTemplates);
		}
		
		for(var i = 0; i < usedTemplates.length; ++i)
		{
			if(usedTemplates[i].userdata.includes)
				cppIncludes.push.apply(cppIncludes, usedTemplates[i].userdata.includes);
		}
		cppIncludes = eliminateDuplicates(cppIncludes);
		
		// ------ hpp ------
		
		var hpp_scope_definition = tHPPTemplate.fetch({ codeGen: this,
														childScopes: childScopes,
														nameChain: nameChain});
		// ------ cpp ------
		
		var cpp_scope_definition = tCPPTemplate.fetch({ codeGen: this,
														childScopes: childScopes,
														childFunctions: childFunctions,
														nameChain: nameChain,
														fullName: fullName,
														newObjectName: (scopeObj.parent == null) ? null : scopeObj.name});	
		// ------ result ------
		if(isInline)
		{
			return { codeGen: this,
					 isInline: true,
			         hpp_scope_definition: hpp_scope_definition,
					 cpp_scope_definition: cpp_scope_definition,
					 scopeName: scopeObj.name,
					 cppIncludes: cppIncludes};
		}
		else
		{
			var fileName = "";	
			for(var i = nameChain.length - 1; i >= 0 ; --i)
				fileName = nameChain[i] + ((i !== nameChain.length-1) ? "/" : "") + fileName;
			
			cppIncludes.push('#include "{$project_include_dir}' + fileName + '.hpp"');
			
			for(var i = 0; i < cppIncludes.length; ++i)
				cppIncludes[i] = (new TemplateManager.jSmart(cppIncludes[i])).fetch({});
			
			// creating the files
			files["include/" + fileName + ".hpp"] = TemplateManager.fetch("CPP_Spidermonkey/hpp_file_for_scope", {codeGen: this, includes: hppIncludes, scopeDefinition: hpp_scope_definition, nameChain: nameChain});
			files["src/"     + fileName + ".cpp"] = TemplateManager.fetch("CPP_Spidermonkey/cpp_file_for_scope", {codeGen: this, includes: cppIncludes, scopeDefinition: cpp_scope_definition, nameChain: nameChain});
			
			return { codeGen: this,
					 isInline: false,
			         files: files,
					 scopeName: scopeObj.name,
					 hppFileName: fileName + ".hpp"};
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
	
};

Extension.inherit(CodeGenerator_Object, ScriptCodeGen);

MetaData.initMetaDataOn(CodeGenerator_Object.prototype)
   .addPropertyData("hppTemplate", {view: {}, load_save: {}})

/**
 * Creates the code generator from the given save object
 * 
 * @param   {Object}                    saveObj        Save object with data
 * @param   {Plugin_CPP_Spidermonkey}   plugin         The plugin the generator will belong to
 * @param   {Export_ASTObject}          exportASTObj   ASTObject the generator will belong to
 * 
 * @returns {CodeGenerator}   The created generator
 */
CodeGenerator_Object.createFromSaveObject =  function createFromSaveObject(saveObj, plugin, exportASTObj)
{
	var result = new CodeGenerator_Object(plugin);
	LoadSaveFromMetaData.loadFrom(result, saveObj);
	return result;
}
