var EXPORTED_SYMBOLS = ["LoadSaveFromMetaData"];

Components.utils.import("chrome://bound/content/modules/MetaData.jsm");
Components.utils.import("chrome://bound/content/modules/log.jsm");

var LoadSaveFromMetaData = {
	/**
	 * Loads properties into the given object from a json compatible object
	 * 
	 * @param   {Object}   obj         Object to load into
	 * @param   {Object}   fromJSON    JSON-compatible object to load properties from
	 * @param   {Object}   [handler]   (optional) Handler that intercepts
	 * 
	 */
	loadFrom: function loadFrom(obj, fromJSON, handler)
	{
		var aggr = MetaData.getMetaDataAggregate(obj);
		
		if(aggr)
		{
			if(!handler)
				handler = this.stdLoadHandler;
			
			var props = aggr.collectMetaDataProperties();
			for(propName in props)
			{
				var prop = props[propName];
				if(prop.load_save)
					handler(obj, fromJSON, propName, prop)
			}
		}
		
	},
	
	/**
	 * Standard handler for loading a property
	 * 
	 * @param   {Object}   obj            Object to load into
	 * @param   {Object}   fromFROM       JSON-compatible object to load from
	 * @param   {String}   propName       Property name to load
	 * @param   {Object}   propMetaData   MetaData of property
	 */
	stdLoadHandler: function stdLoadHandler(obj, fromJSON, propName, propMetaData)
	{
		// TODO: use type information
		//if(propMetaData.type)
		if(propMetaData.load_save.load)
			propMetaData.load_save.load(obj, fromJSON, propName, propMetaData);
		else
			obj[propName] = fromJSON[propName];
	},
	
	/**
	 * Saves the properties into the given object from the other object
	 * 
	 * @param   {Object}   toJSON      JSON-compatible object to save into
	 * @param   {Object}   from        Object to load properties from
	 * @param   {Object}   [handler]   (optional) Handler that intercepts
	 * 
	 */
	saveTo: function saveTo(toJSON, from, handler)
	{
		var aggr = MetaData.getMetaDataAggregate(from);
		
		if(aggr)
		{
			if(!handler)
				handler = this.stdSaveHandler;
			
			var props = aggr.collectMetaDataProperties();
			for(propName in props)
			{
				var prop = props[propName];
				if(prop.load_save)
					handler(toJSON, from, propName, prop)
			}
		}
		
	},
	
	/**
	 * Standard handler for saving a property
	 * 
	 * @param   {Object}   toJSON         JSON-compatible object to save into
	 * @param   {Object}   from           Object to load from
	 * @param   {String}   propName       Property name to save
	 * @param   {Object}   propMetaData   MetaData of property
	 */
	stdSaveHandler: function stdSaveHandler(toJSON, from, propName, propMetaData)
	{
		// TODO: use type information
		//if(propMetaData.type)
		if(propMetaData.load_save.save)
			propMetaData.load_save.save(toJSON, from, propName, propMetaData);
		else
			toJSON[propName] = from[propName];
	}, 
	
	
}