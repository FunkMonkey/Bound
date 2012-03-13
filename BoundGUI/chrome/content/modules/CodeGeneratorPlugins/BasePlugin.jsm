var EXPORTED_SYMBOLS = ["BaseCodeGenPlugin", "BaseEntityCodeGen"];

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
	* Loads from the given JSON-compatible save-object
	* 
	* @param   {Object}   saveObj   Save-object
	*/
	loadFromSaveObject: function loadFromSaveObject(saveObj)
	{
		
	},
	
	/**
	 * Creates a code generator from the given save object
	 * 
	 * @param   {Object}             saveObj        Save object with data
	 * @param   {Export_ASTObject}   exportASTObj   ASTObject the generator will belong to
	 * 
	 * @returns {BaseEntityCodeGen}   The CodeGen instance
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
 * @this {BaseEntityCodeGen}
 */
function BaseEntityCodeGen(plugin)
{
	this.plugin = plugin;
	this._exportObject = null;
}

BaseEntityCodeGen.prototype = {
	
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
	
	/**
	* Loads from the given JSON-compatible save-object
	* 
	* @param   {Object}   saveObj   Save-object
	*/
	loadFromSaveObject: function loadFromSaveObject(saveObj)
	{
		
	},
	
	get exportObject(){ return this._exportObject; },
	set exportObject(val) {this._exportObject = val; },
	
};

Object.defineProperty(BaseEntityCodeGen.prototype, "constructor", {value: BaseEntityCodeGen});