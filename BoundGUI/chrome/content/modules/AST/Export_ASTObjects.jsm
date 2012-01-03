var EXPORTED_SYMBOLS = ["Export_ASTObject"]

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

/**
 * ASTObject
 *
 * @constructor
 * @this {ASTObject}
 */
function Export_ASTObject(parent, name, kind)
{
	this.parent = parent;
	this.name = name;
	this.kind = kind;
	
	this.connectedItem = null;
	
	this.codeGenerators = {};
	
	this.children = [];
	this._childrenMap = {};
}

Export_ASTObject.prototype = {
	constructor: Export_ASTObject,
	
	/**
	 * Adds a code generator to the ASTObject
	 * 
	 * @param   {CodeGenerator}   codeGen   Code generator to add
	 */
	addCodeGenerator: function addCodeGenerator(codeGen)
	{
		if(this.codeGenerators[codeGen.language])
			throw "ASTObject already contains code generator for given language: " + codeGen.language;
		
		this.codeGenerators[codeGen.language] = codeGen;
		codeGen.astObject = this;
	},
	
	/**
	 * Returns the code generator for the given language
	 * 
	 * @param   {String}   language   Language of the code-generator
	 * 
	 * @returns {CodeGenerator}   Code generator; null if not found
	 */
	getCodeGenerator: function getCodeGenerator(language)
	{
		if(this.codeGenerators[language])
			return this.codeGenerators[language];
			
		return null;
	}, 
	
	
};