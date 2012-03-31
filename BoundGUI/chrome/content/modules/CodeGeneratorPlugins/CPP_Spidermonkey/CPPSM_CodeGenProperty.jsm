/*global Components, CPP_ASTObject, CodeGeneratorPluginManager, TemplateManager */

var EXPORTED_SYMBOLS = ["CPPSM_CodeGenProperty"];

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
function CPPSM_CodeGenProperty(plugin)
{
	LanguageBindingEntityCodeGen.call(this, plugin);
	
	this.templatePropertyGet = "CPP_Spidermonkey/property_get";
	this.templatePropertySet = "CPP_Spidermonkey/property_set";
}

CPPSM_CodeGenProperty.isCompatible = isCompatible;

CPPSM_CodeGenProperty.prototype = {
	constructor: CPPSM_CodeGenProperty,
		
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
					
					genInput.templateGet = this._getTemplate(this.templatePropertyGet, diagnosis);
					genInput.templateSet = this._getTemplate(this.templatePropertySet, diagnosis);
					
					// checking the name
					genInput.name = this.exportObject.name;
					if(!isValidIdentifier(genInput.name))
						diagnosis.addReport({ name: "InvalidIdentifier", message: "The given identifier is not valid", type: "ERROR"});
					
					
					// checking the sourceObject
					var astField = this.exportObject.sourceObject;
					if(!astField)
					{
						diagnosis.addReport(this._diagnosisReports["NoSourceObject"]);
					}
					else if(!(astField instanceof CPP_ASTObject_Var_Decl)) // TODO: exclude parameters
					{
						diagnosis.addReport({ name: "WrongASTObject", message: "ASTObject is not a function", type: "ERROR"});
					}
					else
					{
						genInput.isStatic = this.isStatic;
						
						// check member function specific stuff
						if(astField instanceof CPP_ASTObject_Field && !genInput.isStatic)
						{
							if(this.exportObject.parent.sourceObject instanceof CPP_ASTObject_Struct)
							{
								if(!this.exportObject.parent.sourceObject.hasMember(astField))
									diagnosis.addReport({ name: "WrongParent", message: "Parent export object wraps other class", type: "ERROR"});
							}
							else
								diagnosis.addReport({ name: "ParentNotClass", message: "Parent export object is not a class", type: "ERROR"});
						}
						
						// setter
						genInput.getterType = {}
						var tInfoGetter = this.getTypeHandlingTemplate(astField.type, LanguageBindingEntityCodeGen.TYPE_TO_SCRIPT);
						if(tInfoGetter)
						{
							genInput.getterType.templateInfo = tInfoGetter;
							genInput.getterType.template = this._getTemplate(tInfoGetter.templateName, diagnosis);
							
							// check restrictions
							if(tInfoGetter.typeLib)
							{
								var canonicalType = tInfoGetter.astType.getCanonicalType();
								if(canonicalType.declaration || canonicalType.pointsTo)
								{
									if(!tInfoGetter.typeLib.allowWrappingInstances)
										diagnosis.addReport({ name: "GetterTypeRestriction", message: "Getter type does not allow wrapping instances", type: "ERROR"});
								}
							}
						}
						else
							diagnosis.addReport({ name: "ResolvingGetterTemplate", message: "Could not resolve getter type template: " + normalTypePrinter.getAsString(astField.type), type: "ERROR"});
						
						// setter
						genInput.setterType = {}
						var tInfoSetter = this.getTypeHandlingTemplate(astField.type, LanguageBindingEntityCodeGen.TYPE_TO_SCRIPT);
						if(tInfoSetter)
						{
							genInput.setterType.templateInfo = tInfoSetter;
							genInput.setterType.template = this._getTemplate(tInfoSetter.templateName, diagnosis);
							
							// check restrictions
							if(tInfoSetter.typeLib)
							{
								var canonicalType = tInfoSetter.astType.getCanonicalType();
								if(canonicalType.declaration || canonicalType.pointsTo)
								{
									if(!tInfoSetter.typeLib.allowUnwrapping)
										diagnosis.addReport({ name: "SetterTypeRestriction", message: "Setter type does not allow unwrapping instances", type: "ERROR"});
								}
							}
						}
						else
							diagnosis.addReport({ name: "ResolvingSetterTemplate", message: "Could not resolve setter type template: " + normalTypePrinter.getAsString(astField.type), type: "ERROR"});
						
						// instance call
						genInput.isInstanceCall = (astField.kind === ASTObject.KIND_FIELD && !astField.isStatic);
						genInput.parentQualifier = astField.parent.cppLongName;
						genInput.cppFieldName = astField.name;
						
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
			type: "Property",
			isStatic: genInput.isStatic,
			name: genInput.name,
			wrapperGetterFunction: {
				code: "",
				name: "wrapper_get_" + genInput.name // todo: retrieve from function template
			},
			wrapperSetterFunction: {
				code: "",
				name: "wrapper_set_" + genInput.name // todo: retrieve from function template
			},
			includeFiles: null
		};
		
		// the main templates for the property
		var tPropertyGet = genInput.templateGet;
		var tPropertySet = genInput.templateSet;
		
		// getter type
		genInput.getterType.templateInfo.finishStatement = true;		
		genInput.getterType.templateInfo.jsvalName = tPropertyGet.getReturnJSVAL();
		//genInput.getterType.templateInfo.inputVar = (genInput.isInstanceCall == true) ? ;
		var getterTypeCode = templateUser.fetch(genInput.getterType.template, genInput.getterType.templateInfo);
		
		// create the function code
		var funcData = {
			isInstanceCall: genInput.isInstanceCall,
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

Extension.inherit(CPPSM_CodeGenProperty, LanguageBindingEntityCodeGen);

/**
 * Creates the code generator from the given save object
 * 
 * @param   {Object}                    saveObj        Save object with data
 * @param   {CPPSM_Plugin}              plugin         The plugin the generator will belong to
 * @param   {Export_ASTObject}          exportASTObj   ASTObject the generator will belong to
 * 
 * @returns {CPPSM_CodeGenProperty}   The created generator
 */
CPPSM_CodeGenProperty.createFromSaveObject =  function createFromSaveObject(saveObj, plugin, exportASTObj)
{
	var result = new CPPSM_CodeGenProperty(plugin);
	return result;
};