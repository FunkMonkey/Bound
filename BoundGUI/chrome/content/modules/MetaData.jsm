var EXPORTED_SYMBOLS = ["MetaData"];

/**
 * 
 *
 * @constructor
 * @this {MetaDataInfo}
 */
function MetaDataInfo()
{
	this.propertyData = {};
}

MetaDataInfo.prototype = {
	constructor: MetaDataInfo,
	
	/**
	 * Adds property data to the property
	 *
	 * @param   {String|Object}   propertyNameOrMap  Name of the property | map with property data objects
	 * @param   {Object}          propertyData       Data to add
	 */
	addPropertyData: function addPropertyData(propertyNameOrMap, propertyData)
	{
		if(typeof propertyNameOrMap === "Object")
		{
			for(var propertyName in propertyNameOrMap)
				this.propertyData[propertyName] = propertyNameOrMap[propertyName];
		}
		else
		{
			this.propertyData[propertyNameOrMap] = propertyData;
		}
	}, 
	
};

var MetaData = {
	
	/**
	 * Initializes meta data on the given object and returns it
	 * 
	 * @param   {Object}   object          Object to initialize metadata on
	 * @param   {Object}   [propertyData]  (optional) Property-data to add to the meta data object
	 * 
	 * @returns {MetaDataInfo}   MetaData info
	 */
	initMetaDataOn: function initMetaDataOn(object, propertyData)
	{
		if(object.hasOwnProperty("_metaData"))
			return object._metaData;
		
		object._metaData = new MetaDataInfo();
		
		if(propertyData)
			object._metaData.addPropertyData(propertyData)
		
		return object._metaData;
	},
	
	/**
	 * Sets the metadata object on the given js object, replacing the existing if there
	 * 
	 * @param   {Object}         object     Object to set metadata on
	 * @param   {MetaDataInfo}   metaData   MetaDataInfo object to set
	 */
	setMetaDataOn: function setMetaDataOn(object, metaData)
	{
		object._metaData = metaData;
	},
	
};

function MetaDataAggregate(obj)
{
	this.obj = obj;
	this.metaDataObjects = [];
	
	this.collectMetaDataObjects();
}

MetaDataAggregate.prototype = {
	
	constructor: MetaDataAggregate,
	
	/**
	 * Collects all _metaData objects in the prototype chain
	 */
	collectMetaDataObjects: function collectMetaDataObjects()
	{
		this.metaDataObjects.length = 0;
		
		var currObj = this.obj;
		while(currObj)
		{
			if(currObj.hasOwnProperty("_metaData"))
			{
				this.metaDataObjects.push(currObj._metaData);
			}
			
			currObj = Object.getPrototypeOf(currObj);
		}
	}, 	

	/**
	 * Returns the meta-data according to the given name
	 * 
	 * @param   {String}   propertyName   Name of the property
	 * 
	 * @returns {Object}   Meta data
	 */
	getPropertyData: function getPropertyData(propertyName)
	{
		for(var i=0, len = this.metaDataObjects.length; i < len; ++i)
		{
			var data = this.metaDataObjects[i][propertyName];
			if(data)
				return data;
		}
		
		return null;
	}, 
	
	
	/*
	 *
	 */
	getPropertyType: function getPropertyType(propertyName)
	{
		if(!(propertyName in this.propertys) || !this.propertys[propertyName].type)
		{
			var val = this.obj[propertyName];
			
			if(typeof(val) === "string")
				return "string";
			else if(typeof(val) === "boolean")
				return "boolean"
			else if(typeof(val) === "number")
				return "number";
			else if(typeof(val) === "object") // if it is an object, that has no given type, then we'll try some stuff
			{
				if(!val)
					throw "Could not get propertytype!";
				else
					return val.constructor.name;
			}
			else
				throw "Could not get propertytype!";
		}
		else
		{
			return this.propertys[propertyName].type;
		}
	}
};