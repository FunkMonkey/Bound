/*global Components, CPP_ASTObject, CodeGeneratorPluginManager, TemplateManager */

var EXPORTED_SYMBOLS = ["CPPSM_CodeGenFunction"];

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
function CPPSM_CodeGenFunction(plugin)
{
	LanguageBindingEntityCodeGen.call(this, plugin);
	
	this.templateFunction = "CPP_Spidermonkey/function";
}

CPPSM_CodeGenFunction.isCompatible = isCompatible;

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