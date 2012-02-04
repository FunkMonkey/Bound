
var EXPORTED_SYMBOLS = ["ObjectExplorerPropertyManager"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/DOMHelper.jsm");

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
function PropertyFactoryString($row)
{
	$row.refresh = PropertyFactoryString.refresh;
	$row.save = PropertyFactoryString.save;
	
	$row.classList.add("objexp-prop-string");
	
	$row.$textbox = DOMHelper.createDOMNodeOn($row, "textbox", {flex: "1"});
	if($row.propData.readOnly)
		$row.$textbox.readOnly = true;
	else
		$row.$textbox.addEventListener("change", $row.save.bind($row), true);
}

PropertyFactoryString.refresh = function refresh()
{
	this.childNodes[1].value = this.dataHandler.getPropertyValue(this.propName);
}

PropertyFactoryString.save = function save()
{
	try{
		this.dataHandler.setPropertyValue(this.propName, this.childNodes[1].value);
	}
	catch(e)
	{
		if(!this.dataHandler.handleException(this.propName, e))
			throw e;
	}
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("string", PropertyFactoryString);

//======================================================================================//
// PropertyFactoryBoolean
//======================================================================================//
function PropertyFactoryBoolean($row)
{
	$row.refresh = PropertyFactoryBoolean.refresh;
	$row.save = PropertyFactoryBoolean.save;
	
	$row.classList.add("objexp-prop-boolean");
	
	$row.$checkbox = DOMHelper.createDOMNodeOn($row, "checkbox");
	
	if($row.propData.readOnly)
		$row.$checkbox.disabled = true;
	else
		$row.$checkbox.addEventListener("command", $row.save.bind($row), true);
	
}

PropertyFactoryBoolean.refresh = function refresh()
{
	this.childNodes[1].checked = this.dataHandler.getPropertyValue(this.propName);
}

PropertyFactoryBoolean.save = function save()
{
	this.dataHandler.setPropertyValue(this.propName, this.childNodes[1].checked);
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("boolean", PropertyFactoryBoolean);

//======================================================================================//
// PropertyFactoryNumber
//======================================================================================//
function PropertyFactoryNumber($row)
{
	$row.refresh = PropertyFactoryNumber.refresh;
	$row.save = PropertyFactoryNumber.save;
	
	$row.classList.add("objexp-prop-number");
	
	var numDecimals = 2;
	if($row.propData.type && $row.propData.type === "int")
		numDecimals = 0;
	
	$row.$textbox = DOMHelper.createDOMNodeOn($row, "textbox", { type: "number",
															    min: "-Infinity",
															    decimalplaces: "" + numDecimals});
	
	if($row.propData.readOnly)
		$row.$textbox.readOnly = true;
	else
		$row.$textbox.addEventListener("change", $row.save.bind($row), true);
}

PropertyFactoryNumber.refresh = function refresh()
{
	this.childNodes[1].value = this.dataHandler.getPropertyValue(this.propName);
}

PropertyFactoryNumber.save = function save()
{
	this.dataHandler.setPropertyValue(this.propName, Number(this.childNodes[1].value).valueOf());
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("number", PropertyFactoryNumber);

//======================================================================================//
// PropertyFactoryObject
//======================================================================================//
function PropertyFactoryObject($row)
{
	$row.refresh = PropertyFactoryObject.refresh;
	$row.save = PropertyFactoryObject.save;
	
	$row.classList.add("objexp-prop-object");
	
	$row.$resultLabel = DOMHelper.createDOMNodeOn($row, "label");
	
	if($row.propData.readOnly)
		$row.$resultLabel.disabled = true;
}

PropertyFactoryObject.refresh = function refresh()
{
	this.childNodes[1].value = (this.dataHandler.getPropertyValue(this.propName) == null) ? "null" : "object";
}

PropertyFactoryObject.save = function save()
{
	//this.dataHandler.setPropertyValue(this.propName, this.value);
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("object", PropertyFactoryObject);

//======================================================================================//
// PropertyFactoryArray
//======================================================================================//
function PropertyFactoryArray($row)
{
	$row.refresh = PropertyFactoryArray.refresh;
	$row.save = PropertyFactoryArray.save;
	$row._onGroupToggle = PropertyFactoryArray._onGroupToggle;
	
	$row._childrenAdded = false;
	$row.isOpen = false;
	
	$row.classList.add("objexp-prop-array");
	
	$row.$title = DOMHelper.createDOMNodeOn($row, "hbox", {value: $row.propName});
	$row.$title.$twisty = DOMHelper.createDOMNodeOn($row.$title, "image");
	$row.$title.$label  = DOMHelper.createDOMNodeOn($row.$title, "label", {value: $row.propName});
	
	$row.$title.classList.add("objexp-prop-array-title");
	$row.$title.addEventListener("click", $row._onGroupToggle.bind($row), true);
}

PropertyFactoryArray.createContainer = true;

PropertyFactoryArray.refresh = function refresh()
{
	//this.value = (this.dataHandler.getPropertyValue(this.propName) == null) ? "null" : "object";
}

PropertyFactoryArray.save = function save()
{
	//this.dataHandler.setPropertyValue(this.propName, this.value);
	this.refresh();
}

PropertyFactoryArray._onGroupToggle = function()
{
	if(!this._childrenAdded)
	{
		this.$subObjectExplorer = DOMHelper.createDOMNodeOn(this, "vbox", {"class": "objexp-prop-array-content"});
		this.objectExplorer.constructorObjectExplorer.create(this.$subObjectExplorer);
		this.$subObjectExplorer.setAttribute("inner", "true");
		
		this.$subObjectExplorer.setDataHandler(this.dataHandler.getPropertyDataHandler(this.propName));
		//this.objectExplorer.insertPropertiesAfter(this.dataHandler.getPropertyDataHandler(this.propName), this);
		this._childrenAdded = true;
	}
	
	if(this.isOpen)
	{
		this.$subObjectExplorer.style.display = "none";
		this.removeAttribute("open");
	}
	else
	{
		this.$subObjectExplorer.style.display = "-moz-box";
		this.setAttribute("open", "true");
	}
	
	this.isOpen = !this.isOpen;
}

ObjectExplorerPropertyManager.registerPropertyFactory("Array", PropertyFactoryArray);
ObjectExplorerPropertyManager.registerPropertyFactory("KeyValueMap", PropertyFactoryArray);
