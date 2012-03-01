var EXPORTED_SYMBOLS = ["BaseCodeGenPlugin", "BaseCodeGen"];

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {BaseCodeGenPlugin}
 */
function BaseCodeGenPlugin()
{
}

/**
 * Creates a CodeGenPlugin from the given JSON-compatible save-object
 * 
 * @param   {Object}   saveObj   Save-object
 * 
 * @returns {BaseCodeGenPlugin}   New instance of CodeGenPlugin
 */
BaseCodeGenPlugin.createFromSaveObject = function createFromSaveObject(saveObj){};


BaseCodeGenPlugin.prototype = {
	
	context: "Invalid",
	
	/**
	 * Returns the plugin as a JSON compatible savable object
	 * 
	 * @returns {Object}   Object that contains savable data
	 */
	toSaveObject: function toSaveObject()
	{
		return {};
	},
	
	/**
	 * Creates a code generator from the given save object
	 * 
	 * @param   {Object}             saveObj        Save object with data
	 * @param   {Export_ASTObject}   exportASTObj   ASTObject the generator will belong to
	 * 
	 * @returns {BaseCodeGen}   The CodeGen instance
	 */
	createCodeGeneratorFromSaveObject: function createCodeGeneratorFromSaveObject(saveObj, exportASTObj)
	{
		return null;
	}, 
};

Object.defineProperty(BaseCodeGenPlugin.prototype, "constructor", {value: BaseCodeGenPlugin});

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {BaseCodeGen}
 */
function BaseCodeGen(plugin)
{
	this.plugin = plugin;
	this._exportObject = null;
}

BaseCodeGen.prototype = {
	
	get context(){ return this.plugin.context; },	
	
	/**
	 * Returns the generator as a JSON compatible savable object
	 * 
	 * @returns {Object}   Object that contains savable data
	 */
	toSaveObject: function toSaveObject()
	{
		return {};
	},
	
	get exportObject(){ return this._exportObject; },
	set exportObject(val) {this._exportObject = val; },
	
};

Object.defineProperty(BaseCodeGen.prototype, "constructor", {value: BaseCodeGen});