
var EXPORTED_SYMBOLS = ["ObjectExplorerPropertyManager"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/DOMHelper.jsm");

// TODO: make class and let it be used by data handler instead of ObjectExplorer
/**
 * Manages property factories
 * @type Object
 */
var ObjectExplorerPropertyManager = {
	
	_propFactories: {},
	
	/**
	 * Registers a property factory for the given type
	 * 
	 * @param   {string}            type      Type of the property
	 * @param   {PropertyFactory}   factory   Factory to register
	 */
	registerPropertyFactory: function registerPropertyFactory(type, factory)
	{
		this._propFactories[type] = factory;
	},
	
	/**
	 * Returns the property factory for the given type
	 * 
	 * @param   {string}   type   Type of the property
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

// TODO: rename all PropertyFactories to "OE_StringProperty", etc.
//======================================================================================//
// PropertyFactoryString
//======================================================================================//

/**
 * Represents a string property
 * @constructor
 *
 * @param   {DOMElement}   $row   Element to create property on
 */
function PropertyFactoryString($row)
{
	$row.refresh = PropertyFactoryString.refresh;
	$row.save = PropertyFactoryString.save;
	
	$row.classList.add("objexp-prop-string");
	
	var attr = {flex: "1"};
	if($row.propData.multiline)
		attr.multiline = "true";
	
	$row.$textbox = DOMHelper.createDOMNodeOn($row, "textbox", attr);
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
/**
 * Represents a boolean property
 * @constructor
 *
 * @param   {DOMElement}   $row   Element to create property on
 */
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

/**
 * Represents a number property
 * @constructor
 *
 * @param   {DOMElement}   $row   Element to create property on
 */
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
/**
 * Represents a object property
 * @constructor
 *
 * @param   {DOMElement}   $row   Element to create property on
 */
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
	var val = this.dataHandler.getPropertyValue(this.propName);
	
	if(val == null)
		this.childNodes[1].value =  (val === null) ? "null" : "undefined";
	else
		this.childNodes[1].value =  "object";
}

PropertyFactoryObject.save = function save()
{
	//this.dataHandler.setPropertyValue(this.propName, this.value);
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("object", PropertyFactoryObject);
ObjectExplorerPropertyManager.registerPropertyFactory("null", PropertyFactoryObject);
ObjectExplorerPropertyManager.registerPropertyFactory("undefined", PropertyFactoryObject);

//======================================================================================//
// PropertyFactoryArray
//======================================================================================//
/**
 * Represents an array property
 * @constructor
 *
 * @param   {DOMElement}   $row   Element to create property on
 */
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

ObjectExplorerPropertyManager.registerPropertyFactory("Object", PropertyFactoryArray);
ObjectExplorerPropertyManager.registerPropertyFactory("Array", PropertyFactoryArray);
ObjectExplorerPropertyManager.registerPropertyFactory("KeyValueMap", PropertyFactoryArray);

//======================================================================================//
// PropertyFactoryDropdown
//======================================================================================//

/**
 * Represents a dropdown property
 * @constructor
 *
 * @param   {DOMElement}   $row   Element to create property on
 */
function PropertyFactoryDropdown($row)
{
	$row.refresh = PropertyFactoryDropdown.refresh;
	$row.save = PropertyFactoryDropdown.save;
	
	$row.classList.add("objexp-prop-dropdown");
	
	$row.$menuList = DOMHelper.createDOMNodeOn($row, "menulist");
	$row.$menuPopup = DOMHelper.createDOMNodeOn($row.$menuList , "menupopup");
	
	$row.items = $row.propData.metadata.view.dropDownValues;
	
	for(var itemName in $row.items)
	{
		$menuItem = DOMHelper.createDOMNodeOn($row.$menuPopup  , "menuitem", { label: itemName}, {itemValue: $row.items[itemName]});
	}
	
	$row.$menuList.addEventListener("command", $row.save.bind($row), false);
}

PropertyFactoryDropdown.refresh = function refresh()
{
	var val = this.dataHandler.getPropertyValue(this.propName);
	
	var index = 0;
	for(var itemName in this.items)
	{
		if(this.items[itemName] === val)
		{
			this.$menuList.selectedIndex = index;
			break;
		}
		++index;
	}
}

PropertyFactoryDropdown.save = function save()
{
	this.dataHandler.setPropertyValue(this.propName, this.$menuList.selectedItem.itemValue);
	this.refresh();
}

ObjectExplorerPropertyManager.registerPropertyFactory("dropdown", PropertyFactoryDropdown);
