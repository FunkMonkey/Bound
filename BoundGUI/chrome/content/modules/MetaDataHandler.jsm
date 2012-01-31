let EXPORTED_SYMBOLS = ["MetaDataHandler"];

Components.utils.import("chrome://bound/content/modules/log.jsm");

/**
 * 
 *
 * @constructor
 * @this {MetaDataHandler}
 */
function MetaDataHandler(sourceObject)
{
	this.sourceObject = sourceObject;
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
		var props = [];
		for(var propName in this.sourceObject)
		{
			if(this.sourceObject.hasOwnProperty(propName))
			{
				var prop = { name: propName, type: typeof(this.sourceObject[propName])}
				props.push(prop);
			}
		}
		
		return props;
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
};