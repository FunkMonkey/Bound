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
	this._genInput = {};
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
	
	/**
	 * Prepares the content for code generation and saves it in this._genInput.
	 * This happens in multiple rounds (what only makes sense when being recursive).
	 * Saves problems in this._genInput.diagnosis
	 *    - returns if the code generator will produce valid results
	 *
	 * @param   {Number}    round     Round of preparation
	 * @param   {boolean}   recurse   Prepare and diagnose recursively
	 * 
	 * @returns {boolean}   True if valid, otherwise false
	 */
	prepareAndDiagnoseRound: function prepareAndDiagnoseRound(round, recurse)
	{
		return true;
	},
	
	/**
	 * Prepares the content for code generation and saves it in this._genInput.
	 * This happens in multiple rounds (what only makes sense when being recursive).
	 * Saves problems in this._genInput.diagnosis
	 *    - returns if the code generator will produce valid results
	 *
	 * @param   {boolean}   recurse   Prepare and diagnose recursively
	 * 
	 * @returns {boolean}   True if valid, otherwise false
	 */
	prepareAndDiagnose: function prepareAndDiagnose(recurse)
	{
		var result = true;
		for(var i = 1, len = this.plugin.numPrepareRounds; i <= len; ++i)
		{
			if(!this.prepareAndDiagnoseRound(i, recurse))
				result = false;
		}
		
		return result;
	},
	
	/**
	 * Prepares the content of the children and validates them
	 *
	 * @param   {Number}    round     Round of preparation
	 * @param   {boolean}   recurse   Prepare and diagnose recursively
	 * 
	 * @returns {boolean}   True if children valid, otherwise false
	 */
	prepareAndDiagnoseRoundChildren: function prepareAndDiagnoseRoundChildren(round, recurse)
	{
		var result = true;
		for(var i = 0, len = this.exportObject.children.length; i < len; ++i)
		{
			var codeGen = this.exportObject.children[i].getCodeGenerator(this.plugin.context);
			if(codeGen)
			{
				if(!codeGen.prepareAndDiagnoseRound(round, recurse))
					result = false;
			}
		}
		return result;
	},
	
	/**
	 * Generates the result
	 * 
	 * @returns {Object}   Result
	 */
	generate: function generate()
	{
		return null;
	},
	
	get exportObject(){ return this._exportObject; },
	set exportObject(val) {this._exportObject = val; },
	
};

Object.defineProperty(BaseEntityCodeGen.prototype, "constructor", {value: BaseEntityCodeGen});