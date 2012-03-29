let EXPORTED_SYMBOLS = ["MetaDataHandler"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");

Components.utils.import("resource://gre/modules/Services.jsm");

/**
 * Represents a data handler for meta data to be used with an ObjectExplorer
 * @constructor
 *
 * @property   {Object}   sourceObject   Object to handle
 * @property   {boolean}  readOnly       True if properties should be treated as readonly
 * @property   {boolean}  testMultiline  True if strings should be checked for being multiline
 * @property   {Object[]} props          List of properties for the ObjectExplorer
 *
 * @param   {Object}   sourceObject   Object to handle
 * @param   {boolean}  readOnly       True if properties should be treated as readonly
 * @param   {boolean}  testMultiline  True if strings should be checked for being multiline
 */
function MetaDataHandler(sourceObject, readOnly, testMultiline)
{
	this.sourceObject = sourceObject;
	this.readOnly = (readOnly == true)? true : false;
	this.testMultiline = (testMultiline == true)? true : false;
	
	this.props = [];
	
	if(MetaData.hasMetaData(sourceObject))
	{
		var metaDataAggr = this.metaDataAggr = new MetaDataAggregate(sourceObject);
		this.metaDataProps = this.metaDataAggr.collectMetaDataProperties();
		
		var self = this;
		
		for(var propName in sourceObject)
		{
			var metaDataProp = this.metaDataProps[propName];
			if(metaDataProp && metaDataProp.view)
			{
				var type = "";
				if(this.metaDataProps[propName].type)
					type = this.metaDataProps[propName].type;
				else
					type = (MetaData.hasMetaData(sourceObject[propName]) == true) ? "KeyValueMap" : metaDataAggr.getPropertyType(propName);
				
				var prop = {
						name: propName,
						labelName: ("name" in metaDataProp.view) ? metaDataProp.view.name : propName,
						type: type,
						metadata: self.metaDataProps[propName],
						readOnly : readOnly
					};
					
				if(type === "string" && testMultiline && sourceObject[propName].match(/\n/))
					prop.multiline = true;
					
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
					type: (sourceProp && (MetaData.hasMetaData(sourceProp) || typeof(sourceProp) === "object")) ? "KeyValueMap" : typeof(sourceProp),
					readOnly : readOnly
				}
				
			if(prop.type === "string" && testMultiline && sourceObject[propName].match(/\n/))
				prop.multiline = true;
				
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
		return new MetaDataHandler(this.sourceObject[propertyName], this.readOnly, this.testMultiline);
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
		return false;
	}, 
	
	
};