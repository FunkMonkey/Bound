var EXPORTED_SYMBOLS = ["ScriptCodeGenPlugin",
						"ScriptCodeGen",
						"ASTTypeLibraryEntry",
						"TemplateUser",
						"CodeGenDiagnosis",
						"normalTypePrinter"];

Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/BasePlugin.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_TypePrinter.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/ObjectHelpers.jsm");

Components.utils.import("chrome://bound/content/modules/Templates/TemplateManager.jsm");

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
	
	/**
	 * Returns the constructor of a code generator given the ASTObject and
	 * an Export_ASTObject. This function is likely called when trying to add
	 * a new Export_ASTObject to the given parent
	 * 
	 * @param   {ASTObject}          astObject      ASTObject to get codeGen for
	 * @param   {Export_ASTObject}   exportParent   Export ASTObject it will the 
	 * 
	 * @returns {Function}   Constructor function of code generator
	 */
	getCodeGenConstructor: function getCodeGenConstructor(astObject, exportParent)
	{
		return null;
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
	
	this._genInput = {};
}

ScriptCodeGen.prototype = {
	
	/**
	 * Prepares the content for code generation and saves it in this._genInput.
	 * Saves problems in this._genInput.diagnosis
	 *    - returns if the code generator will produce valid results
	 *
	 * @param   {boolean}   recurse   Prepare and diagnose recursively
	 * 
	 * @returns {boolean}   True if valid, otherwise false
	 */
	prepareAndDiagnose: function prepareAndDiagnose(recurse)
	{
		return true;
	},
	
	/**
	 * Prepares the content of the children and validates them
	 *
	 * @param   {boolean}   recurse   Prepare and diagnose recursively
	 * 
	 * @returns {boolean}   True if children valid, otherwise false
	 */
	prepareAndDiagnoseChildren: function prepareAndDiagnose(recurse)
	{
		var result = true;
		for(var i = 0, len = this.exportObject.children.length; i < len; ++i)
		{
			var codeGen = this.exportObject.children[i].getCodeGenerator(this.plugin.context);
			if(codeGen)
			{
				if(!codeGen.prepareAndDiagnose(recurse))
					result = false;
			}
		}
		return result;
	},
	
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
						kind: ScriptCodeGen.TYPE_RESULT_TYPEMAP};
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
						kind: ScriptCodeGen.TYPE_RESULT_TYPEMAP};
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
			kind: ScriptCodeGen.TYPE_RESULT_TYPELIB,
		};
		
		switch(usage)
		{
			case ScriptCodeGen.TYPE_TO_SCRIPT:
				result.templateName = "CPP_Spidermonkey/typelib_to_jsval"; // TODO: make configurable
				break;
				
			case ScriptCodeGen.TYPE_FROM_SCRIPT:
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
ScriptCodeGen.getCompatibilityInformation = function getCompatibilityInformation(astObject, exportParent)
{
	
}, 


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
	 * @returns {Array}   Array of include directives found in used templates
	 */
	aggregateIncludes: function aggregateIncludes()
	{
		var includeFiles = {};
		for(var i = 0; i < this.usedTemplates.length; ++i)
		{
			var template = this.usedTemplates[i];
			if(template.includes)
				ObjectHelpers.mergeKeys(includeFiles, template.includes)
		}
		
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
function CodeGenDiagnosis()
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

