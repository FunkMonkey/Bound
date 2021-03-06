
var EXPORTED_SYMBOLS = ["createObjectExplorer"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/DOMHelper.jsm");
Components.utils.import("chrome://bound/content/modules/UI/Widgets/ObjectExplorerPropertyManager.jsm");


// TODO: make it take DOMeleemnt as first parameter
/**
 * Represents an object explorer widget
 * @constructor
 *
 * @property   {DataHandler}   _dataHandler   Data handler object used for retrieving data
 */
function ObjectExplorer()
{
	this._dataHandler = null;
	this.constructorObjectExplorer = ObjectExplorer;
	
	this.classList.add("object-explorer");
	
	this.$grid    = DOMHelper.createDOMNodeOn(this, "grid");
	
	this.$columns = DOMHelper.createDOMNodeOn(this.$grid, "columns");
	this.$column1 = DOMHelper.createDOMNodeOn(this.$columns, "column");
	this.$column2 = DOMHelper.createDOMNodeOn(this.$columns, "column", {flex: "1"});
	
	this.$rows    = DOMHelper.createDOMNodeOn(this.$grid, "rows");
	
	return this;
}

ObjectExplorer.prototype = {
	/**
	 * Sets the datahandler for the ObjectExplorer
	 * 
	 * @param   {DataHandler}   dataHandler   Datahandler to set
	 */
	setDataHandler: function setDataHandler(dataHandler)
	{
		this._dataHandler = dataHandler;
		
		if(!dataHandler)
			this.removeAllProperties();
		else
			this.appendProperties(dataHandler);
	},
	
	/**
	 * Creates all the properties, removes the old ones
	 */
	appendProperties: function appendProperties(dataHandler)
	{
		this.removeAllProperties();
		this.insertPropertiesAfter(dataHandler, null);
		
	},
	
	/**
	 * Inserts the properties after the given row
	 * 
	 * @param   {DataHandler}   dataHandler   DataHandler for the properties to insert
	 * @param   {element}       $rowBefore    Row after which the properties should be inserted
	 */
	insertPropertiesAfter: function insertPropertiesAfter(dataHandler, $rowBefore)
	{
		// TODO: after custom content
		
		var props = dataHandler.getProperties();
		
		for(var i=0, len = props.length; i < len; ++i)
		{
			var propFactory = ObjectExplorerPropertyManager.getPropertyFactory(props[i].type);
			if(!propFactory)
			{
				log("Could not find prop factory for type: " + props[i].type);
				return;
			}
			
			var $row = null;
			
			if(propFactory.createContainer)
				var $row = DOMHelper.createDOMNodeOnAfter(this.$rows, "vbox", $rowBefore);
			else
			{
				var $row = DOMHelper.createDOMNodeOnAfter(this.$rows, "row", $rowBefore, {"class" : "object-explorer-row"});
				$row.$label = DOMHelper.createDOMNodeOn($row, "label", {value: ("labelName" in props[i]) ? props[i].labelName : props[i].name});
				if(props[i].readOnly)
					$row.$label.disabled = true;
			}
			
			if(props[i].readOnly)
				$row.setAttribute("readOnly", "true");
			
			$row.objectExplorer = this;
			$row.dataHandler = dataHandler;
			$row.propName = props[i].name;
			$row.propData = props[i];
			
			propFactory($row)
			
			$row.refresh();
		}
	},
	
	/**
	 * Removes all properties
	 */
	removeAllProperties: function removeAllProperties()
	{
		while(this.$rows.firstChild)
			this.$rows.removeChild(this.$rows.firstChild);
	}, 
	
};

/**
 * Creats an ObjectExplorer on the given element
 * 
 * @param   {element}   element   Element to create objectExplorer on
 * 
 * @returns {element}   The same element
 */
function createObjectExplorer(element)
{
	Extension.borrow(element, ObjectExplorer.prototype);
	ObjectExplorer.call(element);
	
	return element;
}

ObjectExplorer.create = createObjectExplorer;


// Example Data handler
//
//  function DataHandler()
//  {
//  	
//  }
//  
//  DataHandler.prototype = {
//  	constructor: DataHandler,
//  	
//  	/**
//  	 * Returns information about the properties to be handled
//  	 * 
//  	 * @returns {Array}   Properties to be handled
//  	 */
//  	getProperties: function getProperties()
//  	{
//  		var example = [{
//  			name: "test",
//  			type: "string",
//  			
//  			// custom data
//  			readonly: true
//  		}]
//  	},
//  	
//  	/**
//  	 * Sets the value of a property
//  	 * 
//  	 * @param   {String}   propertyName   Name of the property to set
//  	 * @param   {Value}    value        New value of the property
//  	 */
//  	setPropertyValue: function setPropertyValue(propertyName, value)
//  	{
//  		
//  	},
//  	
//  	/**
//  	 * Returns the value of a property
//  	 * 
//  	 * @param   {String}   propertyName   Name of the property
//  	 * 
//  	 * @returns {Value}   Value of the property
//  	 */
//  	getPropertyValue: function getPropertyValue(propertyName)
//  	{
//  		return null;
//  	}, 
//  };