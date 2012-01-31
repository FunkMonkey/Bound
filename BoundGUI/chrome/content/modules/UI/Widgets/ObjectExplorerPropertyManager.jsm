
var EXPORTED_SYMBOLS = ["ObjectExplorerPropertyManager"];

var ObjectExplorerPropertyManager = {
	
	_propFactories: {},
	
	/**
	 * Registers a property factory for the given type
	 * 
	 * @param   {String}            type      Type of the property
	 * @param   {PropertyFactory}   factory   Factory to register
	 */
	registerPropertyFactory: function registerPropertyFactory(type, factory)
	{
		this._propFactories[type] = factory;
	},
	
	/**
	 * Returns the property factory for the given type
	 * 
	 * @param   {String}   type   Type of the property
	 * 
	 * @returns {PropertyFactory}   Factory
	 */
	getPropertyFactory: function getPropertyFactory(type)
	{
		return (type in this._propFactories) ? this._propFactories[type] : null;
	}, 
}


/*
function PropertyFactory(document, dataHandler, memberName)
{
	var domNode = XXX;
	domNode.dataHandler = dataHandler;
	domNode.memberName = memberName;
	domNode.refresh = refreshFunc;
	domNode.save = saveFunc;
}

 */


//======================================================================================//
// PropertyFactoryString
//======================================================================================//
function PropertyFactoryString(document, dataHandler, propName)
{
	var domNode = document.createElement("textbox");
	domNode.setAttribute("flex", "1");
	
	domNode.dataHandler = dataHandler;
	domNode.propName = propName;
	domNode.refresh = PropertyFactoryString.refresh;
	domNode.save = PropertyFactoryString.save;
	
	domNode.addEventListener("change", domNode.save.bind(domNode), true);
	
	return domNode;
}

PropertyFactoryString.refresh = function refresh()
{
	this.value = this.dataHandler.getPropertyValue(this.propName);
}

PropertyFactoryString.save = function save()
{
	this.dataHandler.setPropertyValue(this.propName, this.value);
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("string", PropertyFactoryString);

//======================================================================================//
// PropertyFactoryBoolean
//======================================================================================//
function PropertyFactoryBoolean(document, dataHandler, propName)
{
	var domNode = document.createElement("checkbox");
	
	domNode.dataHandler = dataHandler;
	domNode.propName = propName;
	domNode.refresh = PropertyFactoryBoolean.refresh;
	domNode.save = PropertyFactoryBoolean.save;
	
	domNode.addEventListener("command", domNode.save.bind(domNode), true);
	
	return domNode;
}

PropertyFactoryBoolean.refresh = function refresh()
{
	this.checked = this.dataHandler.getPropertyValue(this.propName);
}

PropertyFactoryBoolean.save = function save()
{
	this.dataHandler.setPropertyValue(this.propName, this.checked);
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("boolean", PropertyFactoryBoolean);

//======================================================================================//
// PropertyFactoryNumber
//======================================================================================//
function PropertyFactoryNumber(document, dataHandler, propName, data)
{
	var domNode = document.createElement("textbox");
	
	domNode.dataHandler = dataHandler;
	domNode.propName = propName;
	domNode.refresh = PropertyFactoryNumber.refresh;
	domNode.save = PropertyFactoryNumber.save;
	
	var numDecimals = 2;
	if(data && data.type && data.type === "int")
		numDecimals = 0;
	
	domNode.setAttribute("type", "number");
	domNode.setAttribute("min", "-Infinity");
	domNode.setAttribute("decimalplaces", "" + numDecimals);
	
	domNode.addEventListener("change", domNode.save.bind(domNode), true);
	
	return domNode;
}

PropertyFactoryNumber.refresh = function refresh()
{
	this.value = this.dataHandler.getPropertyValue(this.propName);
}

PropertyFactoryNumber.save = function save()
{
	this.dataHandler.setPropertyValue(this.propName, Number(this.value).valueOf());
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("number", PropertyFactoryNumber);

//======================================================================================//
// PropertyFactoryObject
//======================================================================================//
function PropertyFactoryObject(document, dataHandler, propName, data)
{
	var domNode = document.createElement("label");
	
	domNode.dataHandler = dataHandler;
	domNode.propName = propName;
	domNode.refresh = PropertyFactoryObject.refresh;
	domNode.save = PropertyFactoryObject.save;
	
	return domNode;
}

PropertyFactoryObject.refresh = function refresh()
{
	this.value = (this.dataHandler.getPropertyValue(this.propName) == null) ? "null" : "object";
}

PropertyFactoryObject.save = function save()
{
	//this.dataHandler.setPropertyValue(this.propName, this.value);
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("object", PropertyFactoryObject);
