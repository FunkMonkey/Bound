let EXPORTED_SYMBOLS = ["MetaDataHandler"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/MetaData.jsm");

Components.utils.import("resource://gre/modules/Services.jsm");

/**
 * 
 *
 * @constructor
 * @this {MetaDataHandler}
 */
function MetaDataHandler(sourceObject, window, readOnly) // TODO: remove window and just replace handleException!
{
	this.sourceObject = sourceObject;
	this.window = window;
	this.readOnly = (readOnly == true)? true : false;
	
	this.props = [];
	
	if(MetaData.hasMetaData(sourceObject))
	{
		var metaDataAggr = this.metaDataAggr = new MetaDataAggregate(sourceObject);
		this.metaDataProps = this.metaDataAggr.collectMetaDataProperties();
		
		var self = this;
		
		for(var propName in sourceObject)
		{
			if(this.metaDataProps[propName])
			{
				var type = "";
				if(this.metaDataProps[propName].type)
					type = this.metaDataProps[propName].type;
				else
					type = (MetaData.hasMetaData(sourceObject[propName]) == true) ? "KeyValueMap" : metaDataAggr.getPropertyType(propName);
				
				var prop = {
					name: propName,
					type: type,
					metadata: self.metaDataProps[propName],
					readOnly : readOnly
				}
				this.props.push(prop);
			}
			
		}
	}
	else
	{
		for(var propName in sourceObject)
		{
			if(!sourceObject.hasOwnProperty(propName))
				continue;
			
			// does it have meta-data?
			var sourceProp = sourceObject[propName];
			var prop = {
					name: propName,
					type: (sourceProp && MetaData.hasMetaData(sourceProp)) ? "KeyValueMap" : typeof(sourceProp),
					readOnly : readOnly
				}
			
			this.props.push(prop);
		}
	}
	
	
}

MetaDataHandler.prototype = {
	constructor: MetaDataHandler,
	
	/**
	 * Returns information about the properties to be handled
	 * 
	 * @returns {Array}   Properties to be handled
	 */
	getProperties: function getProperties()
	{
		return this.props;
	},
	
	/**
	 * Sets the value of a property
	 * 
	 * @param   {String}   propertyName   Name of the property to set
	 * @param   {Value}    value        New value of the property
	 */
	setPropertyValue: function setPropertyValue(propertyName, value)
	{
		this.sourceObject[propertyName] = value;
	},
	
	/**
	 * Returns the value of a property
	 * 
	 * @param   {String}   propertyName   Name of the property
	 * 
	 * @returns {Value}   Value of the property
	 */
	getPropertyValue: function getPropertyValue(propertyName)
	{
		return this.sourceObject[propertyName];
	},
	
	/**
	 * Returns the DataHandler for the given property (may be needed for arrays / child objects)
	 * 
	 * @param   {String}   propertyName   Name of the property
	 * 
	 * @returns {DataHandler}   DataHandler for the property
	 */
	getPropertyDataHandler: function getPropertyDataHandler(propertyName)
	{
		return new MetaDataHandler(this.sourceObject[propertyName], this.window, this.readOnly);
	},
	
	/**
	 * Handles exceptions for the given property
	 * 
	 * @param   {String}      propertyName   Name of the property
	 * @param   {Exception}   e              Caught exception
	 *
	 * @returns {boolean}   True if exception has been handled, false if it should be rethrown
	 */
	handleException: function handleException(propertyName, e)
	{
		if(typeof e == "string")
			Services.prompt.alert(this.window, "Exception: " + e, e);
		else
			Services.prompt.alert(this.window, "Exception: " + e.name, e.message);
		return true;
	}, 
	
	
};