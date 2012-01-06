var EXPORTED_SYMBOLS = ["CodeGeneratorPluginManager"];

var CodeGeneratorPluginManager = {
	
	_plugins: {},
	
	/**
	 * Registers a plugin
	 * 
	 * @param   {CodeGeneratorPlugin}   plugin   Plugin to register
	 */
	registerPlugin: function registerPlugin(plugin)
	{
		this._plugins[plugin.context] = plugin;
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