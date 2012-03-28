var EXPORTED_SYMBOLS = ["CodeGeneratorPluginManager"];


// TODO: move into BasePlugin

/**
 * Manages the code generator plugin constructor functions
 *
 * @type Object
 */
var CodeGeneratorPluginManager = {
	
	_plugins: {},
	
	/**
	 * Registers a plugin constructor function
	 *
	 * @param   {string}     context  Context of the plugin
	 * @param   {Function}   plugin   Plugin constructor function to register
	 */
	registerPlugin: function registerPlugin(context, plugin)
	{
		this._plugins[context] = plugin;
	},
	
	/**
	 * Returns the plugin for the given context
	 * 
	 * @param   {String}   context   Context (languages, etc.)
	 * 
	 * @returns {CodeGeneratorPlugin}   Found plugin or null
	 */
	getPlugin: function getPlugin(context)
	{
		return (this._plugins[context] == null) ? null : this._plugins[context];
	}, 
}