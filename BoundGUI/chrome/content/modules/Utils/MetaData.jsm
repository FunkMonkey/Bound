var EXPORTED_SYMBOLS = ["MetaData", "MetaDataAggregate", "MetaDataInfo"];

Components.utils.import("chrome://bound/content/modules/log.jsm");


var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Represents meta data that can be attached to an object
 * @constructor
 *
 * @property   {Object}  propertyData   Property data stored
 */
function MetaDataInfo()
{
	this.propertyData = Object.create(null);
	this.constructorFuncName = "";
}

MetaDataInfo.prototype = {
	constructor: MetaDataInfo,
	
	/**
	 * Adds property data to the property
	 *
	 * @param   {string|Object}   propertyNameOrMap  Name of the property | map with property data objects
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
		
		return this;
	},
	
	/**
	 * Registers a constructor function in the class library
	 *   - uses the constructor functions name and the postfix as an id
	 * 
	 * @param   {Function}   func      Constructor function to register
	 * @param   {string}     postfix   Postfix string used for registration
	 */
	setConstructorFunction: function setConstructorFunction(func, postfix)
	{
		
	}, 
	
};

/**
 * Provides functionality for setting and editing meta data
 * @namespace
 *
 * @type Object
 */
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
		if(hasOwnProperty.call(object, "_metaData"))
			return object._metaData;
		
		
		Object.defineProperty(object, "_metaData", { configurable: true, writable: true, enumerable: false, value: new MetaDataInfo()});
		
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
		Object.defineProperty(object, "_metaData", { configurable: true, writable: true, enumerable: false, value: metaData});
	},
	
	/**
	 * Checks if the given object has metadata
	 * 
	 * @param   {Object}   object   Object to check
	 * 
	 * @returns {boolean}   True if it has metadata, otherwise false
	 */
	hasMetaData: function hasMetaData(object)
	{
		if(typeof object === "object" && object && ("_metaData" in object))
			return true;
		else
			return false;
	},
	
	/**
	 * Checks if the given object has *OWN* metadata
	 * 
	 * @param   {Object}   object   Object to check
	 * 
	 * @returns {boolean}   True if it has metadata, otherwise false
	 */
	hasOwnMetaData: function hasOwnMetaData(object)
	{
		if(typeof object === "object" && object && (hasOwnProperty.call(object, "_metaData")))
			return true;
		else
			return false;
	},
	
	/**
	 * Returns the metaDataAggregate for the given object; null if it does not have metaData
	 * 
	 * @param   {Object}   obj   Object to get MetaDataAggregate for
	 * 
	 * @returns {MetaDataAggregate}   MetaDataAggregate
	 */
	getMetaDataAggregate: function getMetaDataAggregate(obj)
	{
		if(this.hasMetaData(obj))
		{
			// loads cached aggregate
			if(hasOwnProperty.call(obj, "_metaDataAggr"))
				return obj._metaDataAggr;
			
			// ... or create a new one
			var aggr = new MetaDataAggregate(obj);
			Object.defineProperty(obj, "_metaDataAggr", { configurable: true, writable: true, enumerable: false, value: aggr});
			return aggr;
		}
		else
			return null;
	},
	
};

/**
 * Represents an aggregate of meta data of the given object
 * @constructor
 *
 * @property   {Object}           obj               Object to aggregate meta data for
 * @property   {MetaDataInfo[]}   metaDataObjects   List of meta data objects
 * @property   {Object}           _properties       Collected data of meta data properties
 *
 * 
 * @param   {Object}   obj   Object to aggregate meta data for
 */
function MetaDataAggregate(obj)
{
	this.obj = obj;
	this.metaDataObjects = [];
	
	this.collectMetaDataObjects();
}

MetaDataAggregate.prototype = {
	
	constructor: MetaDataAggregate,
	
	/**
	 * Collects all _metaData objects in the prototype chain, this first
	 */
	collectMetaDataObjects: function collectMetaDataObjects()
	{
		this.metaDataObjects.length = 0;
		
		var currObj = this.obj;
		while(currObj)
		{
			if(hasOwnProperty.call(currObj, "_metaData"))
			{
				this.metaDataObjects.push(currObj._metaData);
			}
			
			currObj = Object.getPrototypeOf(currObj);
		}
	},
	
	/**
	 * Collects all properties
	 * 
	 * @returns {Object}   Object with all properties
	 */
	collectMetaDataProperties: function collectMetaDataProperties()
	{
		if(this._properties)
			return this._properties;
		
		this._properties = Object.create(null);
		for(var i = 0, len = this.metaDataObjects.length; i < len; ++i)
		{
			var metaDataObjProps = this.metaDataObjects[i].propertyData;
			
			for(propName in metaDataObjProps)
			{
				if(!this._properties[propName])
					this._properties[propName] = metaDataObjProps[propName];
			}
		}
		
		return this._properties;
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
		if(this._properties)
			return (this._properties[propertyName] == null) ? null : this._properties[propertyName];
		else
		{
			for(var i=0, len = this.metaDataObjects.length; i < len; ++i)
			{
				var data = this.metaDataObjects[i][propertyName];
				if(data)
					return data;
			}
			return null;
		}
	}, 
	
	
	/**
	 * Returns the type of the property with the given name
	 *
	 * @param   {string}   propName   Name of the property
	 * @param   {Object}   [prop]     Meta data for the property
	 *
	 * @returns  {string}  Type of the property
	 */
	getPropertyType: function getPropertyType(propertyName, prop)
	{
		if(!prop)
			prop = this.getPropertyData(propertyName);
		
		if(!prop || !prop.type)
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
				if(!val || ! val.constructor)
				{
					return (val === null) ? "null" : "undefined";
				}
				else
					return val.constructor.name;
			}
			else if(typeof(val) === "undefined")
			{
				return "undefined";
			}
			else
			{
				throw "Could not get property type for " + propertyName + "!";
			}
		}
		else
		{
			return prop.type;
		}
	}
};