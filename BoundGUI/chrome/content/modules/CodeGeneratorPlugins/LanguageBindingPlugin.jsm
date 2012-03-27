var EXPORTED_SYMBOLS = ["LanguageBindingCodeGenPlugin",
						"LanguageBindingEntityCodeGen",
						"ASTTypeLibraryEntry",
						"TemplateUser",
						"CodeGenDiagnosis",
						"normalTypePrinter"];

Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/BasePlugin.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_TypePrinter.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/ObjectHelpers.jsm");

Components.utils.import("chrome://bound/content/modules/Templates/TemplateManager.jsm");

Components.utils.import("chrome://bound/content/modules/log.jsm");

//======================================================================================

// type printers
var normalTypePolicy = new CPP_TypePrinterPolicy();
var normalTypePrinter = new CPP_TypePrinter(normalTypePolicy);

var unqualifiedTypePolicy = new CPP_TypePrinterPolicy();
unqualifiedTypePolicy.suppressQualifiers = true;

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
 * @this {LanguageBindingCodeGenPlugin}
 */
function LanguageBindingCodeGenPlugin()
{
	BaseCodeGenPlugin.call(this);
	
	this.typeLibrary = {};
	
	// typeTemplates can include the templates of the plugin's prototype
	// TODO: make a copy!!!
	this.typeTemplates_to_script   = Object.create(this.constructor.prototype.typeTemplates_to_script);
	this.typeTemplates_from_script = Object.create(this.constructor.prototype.typeTemplates_from_script);
}

LanguageBindingCodeGenPlugin.prototype = {
	
	/**
	 * Number of times prepareAndDiagnose will be called
	 */
	numPrepareRounds: 1,
	
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

Object.defineProperty(LanguageBindingCodeGenPlugin.prototype, "constructor", {value: LanguageBindingCodeGenPlugin});

Extension.inherit(LanguageBindingCodeGenPlugin, BaseCodeGenPlugin);

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {LanguageBindingEntityCodeGen}
 */
function LanguageBindingEntityCodeGen(plugin)
{
	BaseEntityCodeGen.call(this, plugin);
	
	// typeTemplates can include the templates of the plugin
	this.typeTemplates_to_script   = Object.create(this.plugin.typeTemplates_to_script);
	this.typeTemplates_from_script = Object.create(this.plugin.typeTemplates_from_script);
	

}

LanguageBindingEntityCodeGen.prototype = {
	
	/**
	 * Returns the template with the given name
	 *   - if template does not exist, then it sets an error in the diagnostic
	 * 
	 * @param   {String}             templateName   Template to get
	 * @param   {CodeGenDiagnosis}   diagnosis      Diagnosis for error reporting
	 * 
	 * @returns {Template}   Template or null if not found
	 */
	_getTemplate: function _getTemplate(templateName, diagnosis)
	{
		try{
			return TemplateManager.getTemplate(templateName);
		} catch(e){
			diagnosis.addReport({ name: "ErrorResolvingTemplate", message: "Could not resolve template: " + templateName + ", " + e.message, type: "ERROR"});
		}
		
		return null;
	},
	
	/**
	 * Returns the include of the source object or sets an error in the diagnosis
	 *
	 * @param   {CodeGenDiagnosis}   diagnosis      Diagnosis for error reporting
	 * 
	 * @returns {String}   Filename or empty string
	 */
	_getSourceObjectIncludeDirective: function _getSourceObjectIncludeDirective(diagnosis)
	{
		var sourceObj = this.exportObject.sourceObject
		
		if(sourceObj)
		{
			var location = (sourceObj.isDefinition == true) ? sourceObj.definition : sourceObj.declarations[0];
			if(location)
			{
				// TODO: fix path
				var fixedPath = location.fileName.replace(sourceObj.AST.translationUnitDirectory, "");
				return '#include <{$CPP_TU_DIR}' + fixedPath + '>';
			}	
		}
		
		diagnosis.addReport({ name: "ResolvingIncludeFilename", message: "Could not resolve filename for include", type: "ERROR"});
		return "";
	}, 
	
	
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
			case LanguageBindingEntityCodeGen.TYPE_TO_SCRIPT:
				if(this.typeTemplates_to_script[astTypeString])
					return this.typeTemplates_to_script[astTypeString];
				
			case LanguageBindingEntityCodeGen.TYPE_FROM_SCRIPT:
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
	 * @returns {Object}   ID of the template
	 */
	_getTypeHandlingTemplateFromTypeMaps: function _getTypeHandlingTemplateFromTypeMaps(astType, usage)
	{
		// try exact type first
		var typeStrings = normalTypePrinter.getAllStrings(astType);
		for(var i = 0, len = typeStrings.length; i < len; ++i)
		{
			var template = this.getTypeHandlingTemplateFromMapsByString(typeStrings[i], usage);
			if(template !== "")
				return {templateName: template,
						typeStringFound: typeStrings[i],
						astType: astType,	
						kind: LanguageBindingEntityCodeGen.TYPE_RESULT_TYPEMAP};
		}
		
		// try with const removed
		var unqualifiedTypeStrings = unqualifiedTypePrinter.getAllStrings(astType);
		for(var i = 0, len = unqualifiedTypeStrings.length; i < len; ++i)
		{
			var template = this.getTypeHandlingTemplateFromMapsByString(unqualifiedTypeStrings[i], usage);
			if(template !== "")
				return {templateName: template,
						typeStringFound: unqualifiedTypeStrings[i],
						astType: astType,	
						kind: LanguageBindingEntityCodeGen.TYPE_RESULT_TYPEMAP};
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
			astType = astType.getCanonicalType();
		
		if(astType.declaration)
			return astType.declaration.USR;
		
		// ---- do we have a pointer type? TODO: shared pointers
		if(astType.pointsTo && astType.pointsTo.declaration)
			return astType.pointsTo.declaration.USR;
		
		return "";
	},
	
	/**
	 * Returns the template that handles the given type for the given usage (TYPE_TO_SCRIPT, TYPE_FROM_SCRIPT)
	 *       from the given type library
	 * 
	 * @param   {CPP_ASTType}           astType   ASTType to find template for
	 * @param   {ASTTypeLibraryEntry}   typeLib   Type library with more information
	 * @param   {Number}                usage     Usage of the type
	 * 
	 * @returns {Object}   Template with information
	 */
	_getTypeHandlingTemplateFromTypeLibrary: function _getTypeHandlingTemplateFromTypeLibrary(astType, typeLib, usage)
	{
		var result = {
			templateName: "",
			astType: astType,	
			typeLib: typeLib,
			kind: LanguageBindingEntityCodeGen.TYPE_RESULT_TYPELIB,
		};
		
		switch(usage)
		{
			case LanguageBindingEntityCodeGen.TYPE_TO_SCRIPT:
				result.templateName = "CPP_Spidermonkey/typelib_to_jsval"; // TODO: make configurable
				break;
				
			case LanguageBindingEntityCodeGen.TYPE_FROM_SCRIPT:
				result.templateName = "CPP_Spidermonkey/jsval_to_typelib"; // TODO: make configurable
				break;
		}
		
		// using the canonical type
		//astType = astType.getCanonicalType();
		
		/*if(astType.declaration)
		{
			result.type = "Object"
		}
		// ---- do we have a pointer type? TODO: shared pointers
		else if(astType.pointsTo && astType.pointsTo.declaration)
		{
			//if(astType.kind === "Pointer")
			//	result.type = "
		}*/
		
		return result;
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
		
		// == 1. check the type
		// --- 1a) check type maps
		var typeMapResult = this._getTypeHandlingTemplateFromTypeMaps(astType, usage);
		if(typeMapResult)
		{
			typeMapResult.typeStringCanonical = normalTypePrinter.getAsString(astType.getCanonicalType());
			return typeMapResult;
		}
		
		// --- 1b)check type libraries
		var typeLib = this.plugin.getTypeLibraryEntry(this._getTypeUSR(astType, true)); // TODO: support non-canonical types
		if(typeLib)
		{
			var result = this._getTypeHandlingTemplateFromTypeLibrary(astType, typeLib, usage);
			result.typeStringCanonical = normalTypePrinter.getAsString(astType.getCanonicalType());
			return result;
		}
		
		// == 2. check base types
		// --- 2a) check type maps
		
		// --- 2b)check type libraries
		
		// == 3. check standard pointer / reference wrapper
		
		
		return null;
	},
	
	/**
	 * Returns the type library entries for the base classes of the given
	 * ASTObject
	 * 
	 * @param   {CPP_ASTObject_Struct}   astObject   ASTObject to get entries for
	 * @param   [Array]                  entries     (optional) Array to add entries to 
	 * 
	 * @returns {Array}   Array of type library entries
	 */
	getBaseTypeLibraryEntries: function getBaseTypeLibraryEntries(astObject, entries)
	{
		// TODO: check valid type
		
		if(!entries)
			entries = [];
		
		for(var i = 0, len = astObject.bases.length; i < len; ++i)
		{
			var entry = this.plugin.getTypeLibraryEntry(astObject.bases[i].base.USR);
			if(entry)
				entries.push(entry);
		}
		
		// second round: go up the inheritence chain
		for(var i = 0, len = astObject.bases.length; i < len; ++i)
			this.getBaseTypeLibraryEntries(astObject.bases[i].base, entries);
		
		return entries;
	}, 
};

/**
 * Returns compatibility information of the code generator given
 * an ASTObject and a possible exportParent
 * 
 * @param   {ASTObject}          astObject      ASTObject to check compatibility for
 * @param   {Export_ASTObject}   exportParent   ExportParent to check compatibility for
 * 
 * @returns {Object}   Compatibility information, if empty, then it is compatible
 */
LanguageBindingEntityCodeGen.getCompatibilityInformation = function getCompatibilityInformation(astObject, exportParent)
{
}, 


LanguageBindingEntityCodeGen.TYPE_TO_SCRIPT   = 1;
LanguageBindingEntityCodeGen.TYPE_FROM_SCRIPT = 2;

LanguageBindingEntityCodeGen.TYPE_RESULT_TYPEMAP = 1;
LanguageBindingEntityCodeGen.TYPE_RESULT_BASETYPEMAP = 2;
LanguageBindingEntityCodeGen.TYPE_RESULT_TYPELIB = 3;
LanguageBindingEntityCodeGen.TYPE_RESULT_BASETYPELIB = 4;
LanguageBindingEntityCodeGen.TYPE_RESULT_VOID_POINTER = 5;
LanguageBindingEntityCodeGen.TYPE_RESULT_VOID_REFERENCE = 6;

Object.defineProperty(LanguageBindingEntityCodeGen.prototype, "constructor", {value: LanguageBindingEntityCodeGen});

Extension.inherit(LanguageBindingEntityCodeGen, BaseEntityCodeGen);

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {TemplateUser}
 */
function TemplateUser()
{
	this.usedTemplates = [];
	this.fetchedIncludes = [];
}

TemplateUser.prototype = {
	/**
	 * Fetches the given template and returns the result string
	 * 
	 * @param   {String|Template}   templateOrName   Name of template to fetch, or template itself
	 * @param   {Object}            data             Data to pass on fetching
	 * 
	 * @returns {String}   Result of the template fetching
	 */
	fetch: function fetch(templateOrName, data)
	{
		if(typeof templateOrName === "string")
			templateOrName = TemplateManager.getTemplate(templateOrName);
		
		this.usedTemplates.push(templateOrName);
		
		
		if(templateOrName.getIncludes)
			this.fetchedIncludes.push.apply(this.fetchedIncludes, templateOrName.getIncludes(data));
		
		return templateOrName.fetch(data);
	},
	
	/**
	 * Uses the template with the given name
	 * 
	 * @param   {String|Template}   templateOrName   Name of template to fetch, or template itself
	 * 
	 * @returns {jSmart}   Template found and used
	 */
	use: function use(templateOrName)
	{
		if(typeof templateOrName === "string")
			templateOrName = TemplateManager.getTemplate(templateOrName);
		
		this.usedTemplates.push(templateOrName);
		
		return templateOrName;
	},
	
	/**
	 * Gets all includes used in the templates
	 * 
	 * @returns {Object}   Object of include directives found in used templates
	 */
	aggregateIncludes: function aggregateIncludes()
	{
		var includeFiles = {};
		for(var i = 0; i < this.usedTemplates.length; ++i)
		{
			var template = this.usedTemplates[i];
			if(template.includes)
				ObjectHelpers.mergeKeys(includeFiles, template.includes);
		}
		
		for(var i = 0, len = this.fetchedIncludes.length; i < len; ++i)
			ObjectHelpers.mergeKeys(includeFiles, this.fetchedIncludes);
		
		return includeFiles;
	}, 
	
	
	
};

Object.defineProperty(TemplateUser.prototype, "constructor", {value: TemplateUser});

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {CodeGenDiagnosis}
 */
function CodeGenDiagnosis() // TODO: inherit from Logger
{
	this.reports = {};
	this.hasErrors = false;
	this.hasWarnings = false;
}

CodeGenDiagnosis.prototype = {
	/**
	 * Adds a report to the diagnosis
	 * 
	 * @param   {Object}   diagnosisReport   Report to add
	 */
	addReport: function addReport(diagnosisReport)
	{
		this.reports[diagnosisReport.name] = diagnosisReport;
		if(diagnosisReport.type === "ERROR")
			this.hasErrors = true;
		else if(diagnosisReport.type === "WARNING")
			this.hasWarnings = true;
	}, 
	
};

Object.defineProperty(CodeGenDiagnosis.prototype, "constructor", {value: CodeGenDiagnosis});

