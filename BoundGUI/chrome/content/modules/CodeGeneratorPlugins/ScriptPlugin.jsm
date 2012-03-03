var EXPORTED_SYMBOLS = ["ScriptCodeGenPlugin", "ScriptCodeGen", "ASTTypeLibraryEntry"];

Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/BasePlugin.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_TypePrinter.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/ObjectHelpers.jsm");

//======================================================================================

// type printers
var normalTypePolicy = new CPP_TypePrinterPolicy();
var normalTypePrinter = new CPP_TypePrinter(normalTypePolicy);

var unqualifiedTypePolicy = new CPP_TypePrinterPolicy();
policy.suppressQualifiers = true;

var unqualifiedTypePrinter = new CPP_TypePrinter(unqualifiedTypePolicy);

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {ASTTypeLibraryEntry}
 */
function ASTTypeLibraryEntry(id)
{
	this.id = id;
}

ASTTypeLibraryEntry.prototype = {
	
};

Object.defineProperty(ASTTypeLibraryEntry.prototype, "constructor", {value: ASTTypeLibraryEntry});

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {ScriptCodeGenPlugin}
 */
function ScriptCodeGenPlugin()
{
	BaseCodeGenPlugin.call(this);
	
	this.typeLibrary = {};
	
	// typeTemplates can include the templates of the plugin's prototype
	// TODO: make a copy!!!
	this.typeTemplates_to_script   = Object.create(this.constructor.prototype.typeTemplates_to_script);
	this.typeTemplates_from_script = Object.create(this.constructor.prototype.typeTemplates_from_script);
}

ScriptCodeGenPlugin.prototype = {
	
	/**
	 * Registers a type library entry
	 * 
	 * @param   {String}                id      ID of the entry, f. ex. USR
	 * @param   {ASTTypeLibraryEntry}   entry   Entry to register
	 */
	addTypeLibraryEntry: function addTypeLibraryEntry(id, entry)
	{
		if(this.typeLibrary[id])
			throw new Error("Type Library Entry already existing.");
			
		this.typeLibrary[id] = entry;
	},
	
	/**
	 * Removes the type library entry with the given id
	 * 
	 * @param   {String}   id   ID of entry to remove
	 */
	removeTypeLibraryEntry: function removeTypeLibraryEntry(id)
	{
		if(this.typeLibrary[id])
			delete this.typeLibrary[id];
	},
	
	/**
	 * Returns the type library entry for the given id
	 * 
	 * @param   {String}   id   ID of entry to get
	 * 
	 * @returns {ASTTypeLibraryEntry}   Entry or null
	 */
	getTypeLibraryEntry: function getTypeLibraryEntry(id)
	{
		var entry = this.typeLibrary[id];
		return (entry == null) ? null : entry;
	}, 
	
	
	
	
};

Object.defineProperty(ScriptCodeGenPlugin.prototype, "constructor", {value: ScriptCodeGenPlugin});

Extension.inherit(ScriptCodeGenPlugin, BaseCodeGenPlugin);

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {ScriptCodeGen}
 */
function ScriptCodeGen(plugin)
{
	BaseCodeGen.call(this, plugin);
	
	// typeTemplates can include the templates of the plugin
	this.typeTemplates_to_script   = Object.create(this.plugin.typeTemplates_to_script);
	this.typeTemplates_from_script = Object.create(this.plugin.typeTemplates_from_script);
}

ScriptCodeGen.prototype = {
	
	/**
	 * Returns the id of the template for the given type by searching the type maps
	 * 
	 * @param   {String}   astTypeString   String of asttype to find template for
	 * @param   {Number}   usage           Usage of the type
	 * 
	 * @returns {String}   ID of the template
	 */
	getTypeHandlingTemplateFromMapsByString: function getTypeHandlingTemplateFromMapsByString(astTypeString, usage)
	{
		switch(usage)
		{
			case ScriptCodeGen.TYPE_TO_SCRIPT:
				if(this.typeTemplates_to_script[astTypeString])
					return this.typeTemplates_to_script[astTypeString];
				
			case ScriptCodeGen.TYPE_FROM_SCRIPT:
				if(this.typeTemplates_from_script[astTypeString])
					return this.typeTemplates_from_script[astTypeString];
		}
		
		return "";
	}, 
	
	
	/**
	 * Returns the id of the template for the given type by searching the type maps
	 * 
	 * @param   {CPP_ASTType}   astType   ASTType to find template for
	 * @param   {Number}        usage     Usage of the type
	 * 
	 * @returns {String}   ID of the template
	 */
	_getTypeHandlingTemplateFromTypeMaps: function _getTypeHandlingTemplateFromTypeMaps(astType, usage)
	{
		// try exact type first
		var typeStrings = normalTypePrinter.getAllStrings(astType);
		for(var i = 0, len = typeStrings.length; i < len; ++i)
		{
			var template = this.getTypeHandlingTemplateFromMapsByString(typeStrings[i], usage);
			if(template !== "")
				return template;
		}
		
		// try with const removed
		var unqualifiedTypeStrings = unqualifiedTypePrinter.getAllStrings(astType);
		for(var i = 0, len = unqualifiedTypeStrings.length; i < len; ++i)
		{
			var template = this.getTypeHandlingTemplateFromMapsByString(unqualifiedTypeStrings[i], usage);
			if(template !== "")
				return template;
		}
		
		return "";
	}, 
	
	/**
	 * Returns a USR of a declaration or pointer
	 * 
	 * @param   {CPP_ASTType}   astType        ASTType to find USR for
	 * @param   {boolean}       useCanonical   Use the canonical type for retrieving the USR
	 * 
	 * @returns {String}   USR or ""
	 */
	_getTypeUSR: function _getTypeUSR(astType, useCanonical)
	{
		if(useCanonical)
			astType = astType.canonicalType;
		
		if(astType.declaration)
			return astType.declaration.USR;
		
		// ---- do we have a pointer type? TODO: shared pointers
		if(astType.pointsTo && astType.pointsTo.declaration)
			return astType.pointsTo.declaration.USR;
		
		return "";
	}, 
	
	
	/**
	* Returns the template that handles the given type for the given usage (TYPE_TO_SCRIPT, TYPE_FROM_SCRIPT)
	* 
	* @param   {CPP_ASTType}   astType   ASTType to find template for
	* @param   {Number}        usage     Usage of the type
	* 
	* @returns {Object}   Template with information
	*/
	getTypeHandlingTemplate: function getTypeHandlingTemplate(astType, usage)
	{
		// throw exception, when TemplateParameterType
		
		var result = {};
		result.templateName = "";
		result.astType = astType;
		
		// == 1. check the type
		// --- 1a) check type maps
		result.templateName = this._getTypeHandlingTemplateFromTypeMaps(astType, usage);
		if(result.templateName !== "")
		{
			result.kind = ScriptCodeGen.TYPE_RESULT_TYPEMAP;
			return result;
		}
		
		// --- 1b)check type libraries
		var typeLib = this.plugin.getTypeLibraryEntry(this._getTypeUSR(astType, true)); // TODO: support non-canonical types
		if(typeLib)
		{
			result.templateName = ""; // TODO: get template name based on usage
			result.typeLib = typeLib;
			result.kind = ScriptCodeGen.TYPE_RESULT_TYPELIB;
			
			return result;
		}
		
		
		// == 2. check base types
		// --- 2a) check type maps
		
		// --- 2b)check type libraries
		
		// == 3. check standard pointer / reference wrapper
		
		
		return null;
	}, 	
};

ScriptCodeGen.TYPE_TO_SCRIPT   = 1;
ScriptCodeGen.TYPE_FROM_SCRIPT = 2;

ScriptCodeGen.TYPE_RESULT_TYPEMAP = 1;
ScriptCodeGen.TYPE_RESULT_BASETYPEMAP = 2;
ScriptCodeGen.TYPE_RESULT_TYPELIB = 3;
ScriptCodeGen.TYPE_RESULT_BASETYPELIB = 4;
ScriptCodeGen.TYPE_RESULT_VOID_POINTER = 5;
ScriptCodeGen.TYPE_RESULT_VOID_REFERENCE = 6;

Object.defineProperty(ScriptCodeGen.prototype, "constructor", {value: ScriptCodeGen});

Extension.inherit(ScriptCodeGen, BaseCodeGen);


