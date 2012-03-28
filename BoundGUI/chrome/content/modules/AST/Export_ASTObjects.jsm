var EXPORTED_SYMBOLS = ["Export_AST",
						"Export_ASTObject"]

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/Utils/Extension.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");

Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CodeGeneratorPluginManager.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");

Cu.import("chrome://bound/content/modules/log.jsm");

/**
 * Represents an export AST
 *
 * @property {Export_ASTObject}           root                   Root node
 * @property {Object<BaseCodeGenPlugin>}  codeGeneratorPlugins   Map of code generator plugins
 * @property {AST}                        sourceAST              C++ AST the export AST is connected to
 *
 * @constructor
 */
function Export_AST(rootNodeName)
{
	if(rootNodeName)
		this.root = new Export_ASTObject(null, rootNodeName, null);
	else
		this.root = new Export_ASTObject(null, "ROOT", null);
		
	this.root._AST = this;
	
	this.codeGeneratorPlugins = {};
}

// TODO: rename to loadFromSaveObject and put into the prototype
/**
 * Creates a CPP_AST given a JSON compatible object
 * 
 * @param   {Object}    saveObj     JSON compatible object
 * @param   {AST}       sourceAST   The Input AST (e.g. CPP_AST) TODO: think about something else
 * 
 * @returns {Exort_AST} New Exort_AST
 */
Export_AST.createFromSaveObject = function createFromSaveObject(saveObj, sourceAST)
{
	var result = new Export_AST();
	result._sourceAST = sourceAST;
	
	// load code generator plugins
	for(var context in saveObj.codeGeneratorPlugins)
	{
		var PluginConstructor = CodeGeneratorPluginManager.getPlugin(context);
		var plugin = new PluginConstructor();
		plugin.loadFromSaveObject(saveObj.codeGeneratorPlugins[context]);
		result.addCodeGeneratorPlugin(plugin);
	}
	
	result.root = Export_ASTObject.createFromSaveObject(saveObj.root, null, result);
	
	return result;
}

Export_AST.prototype = {
	constructor: Export_AST,
	
	/**
	 * Adds a code generator plugin to the AST
	 * 
	 * @param   {BaseCodeGenPlugin}   codeGenPlugin   Code generator plugin to add
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
	 * @param   {string}   context   Context of the code-generator plugin
	 * 
	 * @returns {BaseCodeGenPlugin}   Code generator plugin; null if not found
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
		
		// save code generator plugins
		result.codeGeneratorPlugins = {};
		for(var context in this.codeGeneratorPlugins)
			result.codeGeneratorPlugins[context] = this.codeGeneratorPlugins[context].toSaveObject();
			
		return result;
	},
	
	get sourceAST(){ return this._sourceAST; },
	set sourceAST(val)
	{
		if(val === this._sourceAST)
			return;
		
		this._sourceAST = val;
		
		if(this._sourceAST)
		{
			this.root.onSourceASTChanged(this._sourceAST);
		}
	}
}

/**
 * Represents an export AST node
 *
 * @constructor
 * @extends ASTObject
 * 
 * @property {ASTObject}                   sourceObject     Source AST node (e.g. CPP_ASTObject)
 * @property {number}                      kind             Kind of the node
 * @property {Object<BaseEntityCodeGen>}   codeGenerators   Code generators (mapped by context)
 * 
 * @param   {Export_ASTObject}   parent         Parent of the ASTObject
 * @param   {string}             name           Name of the ASTObject
 * @param   {ASTObject}          sourceObject   Source AST node (e.g. CPP_ASTObject)
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
	
	/**
	 * Renames the given child
	 * 
	 * @param   {Export_ASTObject}   child            Child to rename
	 * @param   {string}             newName          New name of the child
	 */
	_renameChild: function _renameChild(child, newName)
	{
		if(newName == "")
			throw "Cannot give Export_ASTObject an empty name!"
		
		ASTObject.prototype._renameChild.call(this, child, newName);
	},
	
	// TEMPORARY
	get kind(){
		return (this.sourceObject == null) ? ASTObject.KIND_OBJECT : this.sourceObject.kind;
	},
	
	/**
	 * Adds a code generator to the ASTObject
	 * 
	 * @param   {BaseEntityCodeGen}   codeGen   Code generator to add
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
	 * @param   {string}   context   Context of the code-generator
	 * 
	 * @returns {BaseEntityCodeGen}   Code generator; null if not found
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
		if(this.sourceObject)
		{
			result.sourceObject = {
				referenceID: this.sourceObject.getReferenceID()
			}
		}
		else if(this._sourceObjectSaveObject)
		{
			result.sourceObject = this._sourceObjectSaveObject;
		}
		else
			result.sourceObject = null;
		
		
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
	
	/**
	 * Called when the sourceAST of the export tree changed
	 * 
	 * @param   {AST}   sourceAST   New source AST
	 */
	onSourceASTChanged: function onSourceASTChanged(sourceAST)
	{
		if(this.sourceObject)
		{
			if(this.sourceObject.AST !== sourceAST)
			{
				var sourceObject = sourceAST.astObjectsByUSR[this.sourceObject.getReferenceID()];
				if(sourceObject)
				{
					if(this._sourceObjectSaveObject)
						delete this._sourceObjectSaveObject;
						
					this.sourceObject = sourceObject;
				}
				else
				{
					this._sourceObjectSaveObject = {
							referenceID: this.sourceObject.getReferenceID()
						};
					log("ERROR: TODO: could not resolve sourceObject from SaveObject!!!")
					this.sourceObject = null;
				}
			}
		}
		else if(this._sourceObjectSaveObject)
		{
			var sourceObject = sourceAST.astObjectsByUSR[this._sourceObjectSaveObject.referenceID];
			if(sourceObject)
			{
				delete this._sourceObjectSaveObject;
					
				this.sourceObject = sourceObject;
			}
			else
			{
				log("ERROR: TODO: could not resolve sourceObject from SaveObject!!!")
			}
		}
		
		for(var i = 0; i < this.children.length; ++i)
		{
			this.children[i].onSourceASTChanged(sourceAST);
		}
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
	var result = new Export_ASTObject(parent, saveObject.name, null);
	
	if(ast)
		result._AST = ast;
	else
		ast = parent.AST;
		
	// name resolution, TODO: do not C++-specific!
	if(saveObject.sourceObject)
	{
		var sourceObject = ast.sourceAST.astObjectsByUSR[saveObject.sourceObject.referenceID];
		if(sourceObject)
		{
			result.sourceObject = sourceObject;
		}
		else
		{
			result._sourceObjectSaveObject = saveObject.sourceObject;
			log("ERROR: TODO: could not resolve sourceObject from SaveObject!!!")
		}
	}
		
	// loading codeGenerators
	for(var context in saveObject.codeGenerators)
	{
		var plugin = ast.getCodeGeneratorPlugin(context);
		var codeGen = plugin.createCodeGeneratorFromSaveObject(saveObject.codeGenerators[context], result);
		result.addCodeGenerator(codeGen);
	}
	
	// loading children
	for(var i = 0, len = saveObject.children.length; i < len; ++i)
	{
		var child = Export_ASTObject.createFromSaveObject(saveObject.children[i], result);
		result.addChild(child);
	}
	
	return result;
}

Extension.inherit(Export_ASTObject, ASTObject);

MetaData.initMetaDataOn(Export_ASTObject.prototype)
    .addPropertyData("codeGenerators", { type: "KeyValueMap", view: {}})
    .addPropertyData("sourceObject",   { view: {}})

