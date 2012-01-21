var EXPORTED_SYMBOLS = ["Export_AST",
						"Export_ASTObject"]

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/Extension.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");

/**
 * Export_AST
 *
 * @constructor
 */
function Export_AST(rootNodeName)
{
	if(rootNodeName)
	{
		this.root = new Export_ASTObject(null, rootNodeName, null);
		this.root._AST = this;
	}
	else
		this.root = null;
	
	
	this.codeGeneratorPlugins = {};
}

/**
 * Creates a CPP_AST given a JSON compatible object
 * 
 * @param   {Object}   jsonObj   JSON compatible object
 * 
 * @returns {CPP_AST} New CPP_AST
 */
Export_AST.createFromSaveObject = function createFromSaveObject(jsonObj)
{
	var result = new Export_AST();
	
	result.root = Export_ASTObject.createFromSaveObject(null, jsonObj, result);
	
	return result;
}

Export_AST.prototype = {
	constructor: Export_AST,
	
	/**
	 * Adds a code generator plugin to the AST
	 * 
	 * @param   {CodeGeneratorPlugin}   codeGenPlugin   Code generator to add
	 */
	addCodeGeneratorPlugin: function addCodeGenerator(codeGenPlugin)
	{
		if(this.codeGeneratorPlugins[codeGenPlugin.context])
			throw "AST already contains code generator plugin for given context: " + codeGenPlugin.context;
		
		this.codeGeneratorPlugins[codeGenPlugin.context] = codeGenPlugin;
		codeGenPlugin.AST = this;
	},
	
	/**
	 * Returns the code generator plugin for the given language
	 * 
	 * @param   {String}   context   Context of the code-generator plugin
	 * 
	 * @returns {CodeGeneratorPlugin}   Code generator plugin; null if not found
	 */
	getCodeGeneratorPlugin: function getCodeGenerator(context)
	{
		if(this.codeGeneratorPlugins[context])
			return this.codeGeneratorPlugins[context];
			
		return null;
	},
	
	/**
	 * Returns the Export_AST as a JSON compatible savable object
	 * 
	 * @returns {Object}   Object that contains savable data
	 */
	toSaveObject: function toSaveObject()
	{
		var result = {};
		result.root = this.root.toSaveObject();
		
		// code generator plugins
		result.codeGeneratorPlugins = {};
		for(var context in this.codeGeneratorPlugins)
			result.codeGeneratorPlugins[context] = this.codeGeneratorPlugins[context].toSaveObject();
			
		return result;
	}
}

/**
 * ASTObject
 *
 * @constructor
 * @extends ASTObject
 */
function Export_ASTObject(parent, name, sourceObject)
{
	ASTObject.call(this, parent, name);
	
	//this.kind = kind;
	
	this.sourceObject = sourceObject;
	
	this.codeGenerators = {};
}

Export_ASTObject.prototype = {
	constructor: Export_ASTObject,
	
	// TEMPORARY
	get kind(){ return (this.sourceObject == null) ? ASTObject.KIND_INVALID : this.sourceObject.kind; },
	
	/**
	 * Adds a code generator to the ASTObject
	 * 
	 * @param   {CodeGenerator}   codeGen   Code generator to add
	 */
	addCodeGenerator: function addCodeGenerator(codeGen)
	{
		if(this.codeGenerators[codeGen.context])
			throw "ASTObject already contains code generator for given context: " + codeGen.context;
		
		this.codeGenerators[codeGen.context] = codeGen;
		codeGen.exportObject = this;
	},
	
	/**
	 * Returns the code generator for the given language
	 * 
	 * @param   {String}   context   Context of the code-generator
	 * 
	 * @returns {CodeGenerator}   Code generator; null if not found
	 */
	getCodeGenerator: function getCodeGenerator(context)
	{
		if(this.codeGenerators[context])
			return this.codeGenerators[context];
			
		return null;
	},
	
	/**
	 * Returns the ExportObject as a JSON compatible savable object
	 * 
	 * @returns {Object}   Object that contains savable data
	 */
	toSaveObject: function toSaveObject()
	{
		var result = {};
		
		result.name = this.name;
		
		// saving sourceObject: different if it is self-saved like a C++-AST
		// TODO: make the difference!
		result.sourceObject = {
			referenceID: this.sourceObject.getReferenceID()
		}
		
		// saving codeGenerators
		result.codeGenerators = {};
		for(var context in this.codeGenerators)
			result.codeGenerators[context] = this.codeGenerators[context].toSaveObject();
		
		// saving children
		result.children = [];
		for(var i = 0; i < this.children.length; ++i)
		{
			result.children.push(this.children[i].toSaveObject());
		}
		
		return result;
	},
};

/**
* Creates an ExportASTObject based on a given saveObject
* 
* @param   {Object}             saveObject   The given object with saved data
* @param   {Export_ASTObject}   parent       Parent of the object
* @param   {Export_AST}         ast          The AST this object will belong to
* 
* @returns {Export_ASTObject}   New Export ASTObject
*/
Export_ASTObject.createFromSaveObject = function createFromSaveObject(saveObject, parent, ast)
{
	var sourceObject = null; // name resolution
	
	var result = new Export_ASTObject(parent, saveObject.name, sourceObject);
	
	if(ast)
		result._AST = ast;
	else
		ast = parent.AST;
		
	// loading codeGenerators
	for(var context in saveObject.codeGenerators)
	{
		var plugin = ast.getCodeGeneratorPlugin(context);
		var codeGen = plugin.createCodeGeneratorFromSaveObject(saveObject.codeGenerators, result);
		this.addCodeGenerator(codeGen);
	}
	
	// loading children
	for(var i = 0, len = saveObject.children.length; i < len; ++i)
	{
		var child = Export_ASTObject.createFromSaveObject(saveObject.children[i], result);
		this.addChild(child);
	}
	
	return result;
}

Extension.inherit(Export_ASTObject, ASTObject);

