var EXPORTED_SYMBOLS = ["Plugin_CPP_Spidermonkey"];

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");

Components.utils.import("chrome://bound/content/modules/TemplateManager.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CodeGeneratorPluginManager.jsm");

Components.utils.import("chrome://bound/content/modules/MetaData.jsm");

/**
 * 
 *
 * @constructor
 * @this {Plugin_CPP_Spidermonkey}
 */
function Plugin_CPP_Spidermonkey()
{
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
}, 

Plugin_CPP_Spidermonkey.prototype = {
	constructor: Plugin_CPP_Spidermonkey,
	
	context: "CPP_Spidermonkey",
	
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
			return null;
		
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

CodeGeneratorPluginManager.registerPlugin(Plugin_CPP_Spidermonkey.prototype.context, Plugin_CPP_Spidermonkey);

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
		var usedTemplates = [];
		
		var tFunction = TemplateManager.getTemplate("CPP_Spidermonkey/function");
		//var tFunctionDefine = TemplateManager.getTemplate("CPP_Spidermonkey/function_define");
		usedTemplates.push(tFunction);
		//usedTemplates.push(tFunctionDefine);
		
		var astFunc = this.exportObject.sourceObject;
		
		var parameters_init = "";
		var call_parameters = "";
		for(var i = 0; i < astFunc.parameters.length; ++i)
		{
			var param = astFunc.parameters[i];
			var name = "p__" + param.name;
			
			var tParamInit = TemplateManager.getTemplate(this.parameterTemplates[param.typeCanonical.kind]);
			usedTemplates.push(tParamInit);
			
			parameters_init += tParamInit.fetch({param_name: name, param_type: param.typeCanonical.getAsCPPCode(), param_index: i}) + "\n";
		
			call_parameters += name + ((i != astFunc.parameters.length - 1) ? ", " : "");
		}
		
		var parent_qualifier = astFunc.parent.cppLongName;
		
		var data = {
			is_instance_call: (astFunc.kind === ASTObject.KIND_MEMBER_FUNCTION && !astFunc.isStatic),
			numParams: astFunc.parameters.length,
			parameters_init: parameters_init,
			call_parameters: call_parameters,
			parent_qualifier: parent_qualifier,
			wrapper_funcName: "wrapper_" + this.exportObject.name,
			funcName: this.exportObject.sourceObject.name,
		}
		
		//var defineData = {
		//	wrapper_funcName: data.wrapper_funcName,
		//	funcName: this.exportObject.name,
		//	num_params: astFunc.parameters.length
		//}
		
		if(astFunc.returnTypeCanonical.kind !== "Void")
		{
			data.return_type = astFunc.returnTypeCanonical.getAsCPPCode();
			var tReturnCode = TemplateManager.getTemplate(this.returnTemplates[astFunc.returnTypeCanonical.kind]);
			usedTemplates.push(tReturnCode);
			data.returnCode = tReturnCode.fetch({});
		}
		else
		{
			var tReturnVoid = TemplateManager.getTemplate("CPP_Spidermonkey/return_void");
			usedTemplates.push(tReturnVoid);
			data.returnCode = tReturnVoid.fetch({});
		}
		
		var includeFiles = [];
		for(var i = 0; i < usedTemplates.length; ++i)
		{
			if(usedTemplates[i].userdata.includes)
				includeFiles.push.apply(includeFiles, usedTemplates[i].userdata.includes);
		}
		
		var location = (astFunc.isDefinition == true) ? astFunc.definition : astFunc.declarations[0];
		
		if(location)
		{
			var fixedPath = location.fileName.replace(astFunc.AST.TUPath, "");
			includeFiles.push('#include "{$CPP_TU_DIR}' + fixedPath + '"');
		}
		
		return {  isFunction: true,
				  isStatic: astFunc.isStatic,
				  numParams: astFunc.parameters.length,
		  		  wrapper_function_code: tFunction.fetch(data),
				  wrapper_function_name: data.wrapper_funcName,
				  funcName: this.exportObject.name,
		          //define_code:           tFunctionDefine.fetch(defineData),
				  includeFiles:          includeFiles}; // TODO: return as the data itself (name, etc)
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
	this.plugin = plugin;
	this.exportObject = null;
	
	this.hppTemplate = "You fool!";
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
		
		if(sourceObj.kind === ASTObject.KIND_STRUCT || sourceObj.kind === ASTObject.KIND_CLASS)
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
		return {};
	},
	
};

MetaData.initMetaDataOn(CodeGenerator_Object.prototype)
   .addPropertyData("hppTemplate", {viewable: true})

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
	return result;
}

//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/function");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/function_define");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_boolean");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_int");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_uint");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/param_jsval_to_float");
//
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_void");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_boolean");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_int");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/return_float");
//
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/scope_definition");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/hpp_file_for_scope");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/hpp_scope_content_class");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/hpp_scope_content_init");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/cpp_file_for_scope");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/cpp_scope_content_object");
//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/scope_init_call");
//log();