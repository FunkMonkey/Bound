/*global Components, CPP_ASTObject, CodeGeneratorPluginManager, TemplateManager */

var EXPORTED_SYMBOLS = ["CPPSM_CodeGenObject"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/LanguageBindingPlugin.jsm");

Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");

Components.utils.import("chrome://bound/content/modules/Templates/TemplateManager.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/LoadSaveFromMetaData.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/ObjectHelpers.jsm");

Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey/CPPSM_Shared.jsm");

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

setCPPSM_CodeGenObject(CPPSM_CodeGenObject);
CPPSM_CodeGenObject.isCompatible = isCompatible;

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
