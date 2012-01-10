var EXPORTED_SYMBOLS = ["Export_ASTObject"]

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/Extension.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");

/**
 * ASTObject
 *
 * @constructor
 * @this {ASTObject}
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
};

Extension.inherit(Export_ASTObject, ASTObject);

