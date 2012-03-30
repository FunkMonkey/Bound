/*global Components, Extension, DOMTree, Services, MetaDataHandler, ForwardProxyHandler, Proxy, DOMHelper */
/*jshint latedef:false */

var EXPORTED_SYMBOLS = ["initExportTree", "getExportTree"];


Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/UI/Widgets/DOMTree.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Export_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey/CPPSM_Plugin.jsm");

Components.utils.import("chrome://bound/content/modules/Bound.jsm");


Components.utils.import("chrome://bound/content/modules/Utils/MetaDataHandler.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/ForwardProxy.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/DOMHelper.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/ExceptionHandling.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");


var MainWindow = null;
var document = null;

var $exportTree = null;

/**
* Initializes the Export tree
* 
* @param   {Object}   mainWindowModule   JSM for the main window
*/
function initExportTree(mainWindowModule)
{
	MainWindow = mainWindowModule;
	document = MainWindow.$document;
	
	$exportTree = document.getElementById("exportTree");
	Extension.borrow($exportTree, ExportTreePrototype);
	$exportTree.exportAST = null;
	
	
	$exportTree = DOMTree.createOn($exportTree, $exportTree._dataCB.bind($exportTree));
	$exportTree.addEventListener("dragover", $exportTree._checkDrag);
	$exportTree.addEventListener("dragenter", $exportTree._checkDrag);
	$exportTree.addEventListener("drop", $exportTree._onDrop);
	$exportTree.addEventListener("click", $exportTree._onClick);
	$exportTree.addEventListener("select", wrapWithTryAndCatch($exportTree._onSelect, Bound.errorCallback));
	$exportTree.addEventListener("keypress", $exportTree._onKeyUp);
	
	$exportTree.$dropMenuPopup = DOMHelper.createDOMNodeOn($exportTree, "menupopup");
	
	return $exportTree;
}

/**
 * Prototype for the export tree
 * @type Object
 */
var ExportTreePrototype = {
	
	
	_proxySet: function _proxySet(receiver, name, val) {
		
		this.obj[name] = val;
		if(name === "name" && this.obj._exportTreeRow)
			this.obj._exportTreeRow.invalidate();
			
		return true;
	}, // bad behavior when set fails in non-strict mode
	
	/**
	 * Handles exceptions for the given property
	 * 
	 * @param   {String}      propertyName   Name of the property
	 * @param   {Exception}   e              Caught exception
	 *
	 * @returns {boolean}   True if exception has been handled, false if it should be rethrown
	 */
	_metaHandleException: function handleException(propertyName, e)
	{
		if(typeof e === "string")
			Services.prompt.alert(this.window, "Exception: " + e, e);
		else
			Services.prompt.alert(this.window, "Exception: " + e.name, e.message);
		return true;
	},
	
	/**
	 * Returns the DataHandler for the given property (may be needed for arrays / child objects)
	 * 
	 * @param   {String}   propertyName   Name of the property
	 * 
	 * @returns {DataHandler}   DataHandler for the property
	 */
	_metaGetPropertyDataHandler: function getPropertyDataHandler(propertyName)
	{
		var handler = MetaDataHandler.prototype.getPropertyDataHandler.call(this, propertyName);
		handler.handleException = ExportTreePrototype._metaHandleException;
		handler.getPropertyDataHandler = ExportTreePrototype._metaGetPropertyDataHandler;
		return handler;
	},
	
	/**
	 * Called when selection in the tree changed
	 * 
	 * @param   {DOMEvent}   event   Event
	 */
	_onSelect: function _onSelect(event)
	{
		//this.$exportASTTree.focus();
		if(this.selection.length > 0)
		{
			this.inspectExportObject(this.selection[0].data);
		}
	},
	
	/**
	 * Inspects the given AST object
	 * 
	 * @param   {Export_ASTObject}   exportObject   Description
	 */
	inspectExportObject: function inspectExportObject(exportObject)
	{
		var proxyHandler = new ForwardProxyHandler(exportObject);
		proxyHandler.set = this._proxySet;
		var proxy = Proxy.create(proxyHandler, Object.getPrototypeOf(proxyHandler.obj));
		var handler = new MetaDataHandler(proxy);
		handler.handleException = this._metaHandleException;
		handler.getPropertyDataHandler = this._metaGetPropertyDataHandler;
		MainWindow.PropertyExplorer.setDataHandler(handler);
		
		MainWindow.PropertyExplorer.$label.value = "Inspecting: " + exportObject.name;
		MainWindow.ResultTabbox.displayCodeGenResult(exportObject);
	}, 
	
	
	/**
	 * Shows the root node in the property explorer
	 */
	editRoot: function editRoot()
	{
		this.clearSelection();
		this.inspectExportObject(this.exportAST.root);
	}, 
	
	
	/**
	 * Called when a key goes up
	 * 
	 * @param   {DOMEvent}   event   Event
	 */
	_onKeyUp: function _onKeyUp(event)
	{
		if(this.selection.length > 0)
		{
			if(event.keyCode === 46)
			{
				for(var i = 0, len = this.selection.length; i < len; ++i)
				{
					this.selection[i].data.parent.removeChild(this.selection[i].data);
					this.removeRow(this.selection[i]);
				}
			}
			MainWindow.PropertyExplorer.setDataHandler(null);
		}
	},
	
	/**
	 * Creates a tree row for the given AST node
	 * 
	 * @param   {ASTObject}    astNode   AST node to create row for
	 * @param   {DOMTreeRow}   $parent   Parent row
	 *
	 * @returns {DOMTreeRow}   Newly created row
	 */
	astNodeToTreeNode: function astNodeToTreeNode(astNode, $parent)
	{
		var $row = this.createAndAppendRow($parent, astNode.children.length !== 0, astNode);
		astNode._exportTreeRow = $row;
		
		for(var childName in astNode._childrenMap)
		{
			var child = astNode._childrenMap[childName];
			
			// handle overloads
			if(child instanceof ASTOverloadContainer)
			{
				var $sameNameRow = this.createAndAppendRow($row, true, child);
				
				for(var i = 0; i < child.overloads.length; ++i)
				{
					this.astNodeToTreeNode(child.overloads[i], $sameNameRow);
				}
			}
			else
			{
				this.astNodeToTreeNode(child, $row);
			}
		}
		
		return $row;
	},
	
	/**
	 * Sets the Export tree
	 * 
	 * @param   {Export_AST}    exportAST   AST to set
	 */
	setExportAST: function setExportAST(exportAST)
	{
		this.exportAST = exportAST;
		
		this.removeAllRows();
		
		for(var i = 0; i < this.exportAST.root.children.length; ++i)
		{
			var child = this.exportAST.root.children[i];
			this.astNodeToTreeNode(child, null);
		}
	},
	
	/**
	 * On drop event
	 * 
	 * @param   {DOMEvent}   event   Passed event
	 */
	_onDrop: function _onDrop(event)
	{
		try
		{
			var data = event.dataTransfer.mozGetDataAt("application/x-tree-data", 0).data;
			
			var $parentNode = null;
			if(event.target !== this)
			{
				var $parentNode = event.target.parentNode;
				while(!$parentNode.isRow)
					$parentNode = $parentNode.parentNode;
			}
			
			var exportParent = ($parentNode == null) ? this.exportAST.root : $parentNode.data;
			
			var plugin = exportParent.AST.getCodeGeneratorPlugin(Bound.currentContext);
			if(!plugin)
				throw "No plugin for context: " + Bound.currentContext;
			
			// TODO: get functions from exportParent, exportParent.sourceObject, codegen!
			var dropInfo = {
				exportParent: exportParent,
				contextPlugin: plugin,
				$parentRow: $parentNode,
				astObjects: data
			}
			
			var menuItems = this._addDropMenuItems(dropInfo);
			if(menuItems.length > 1)
			{
				this._updateMenu(menuItems);
				this.$dropMenuPopup.openPopup(($parentNode == null) ? this : $parentNode, ($parentNode == null) ? "overlap" : "after_start", 0, 0, true, false);
			}
			else if(menuItems.length !== 0)
			{
				menuItems[0].func();
			}
			
			//for(var i = 0; i < data.length; ++i)
			//{
			//	var codeGenConstructor = plugin.getCodeGeneratorByASTObject(data[i], exportParent);
			//	
			//	if(codeGenConstructor)
			//	{
			//		var exportASTObject = new Export_ASTObject(exportParent, data[i].name, data[i]);
			//		exportParent.addChild(exportASTObject);
			//		exportASTObject.addCodeGenerator(new codeGenConstructor(plugin));
			//		var $newRow = this.createAndAppendRow($parentNode, false, exportASTObject);
			//		exportASTObject._exportTreeRow = $newRow;
			//		this.select($newRow);
			//		
			//		MainWindow.ResultTabbox.displayCodeGenResult(exportASTObject);
			//		
			//		if($parentNode && !$parentNode.isContainerOpen)
			//			$parentNode.toggleCollapse();
			//	}
			//}
		
		} catch(e) {
			if(typeof e == "string")
				Services.prompt.alert(this.window, "Exception: " + e, e);
			else
				Services.prompt.alert(this.window, "Exception: " + e.name, e.message);
		}
	},
	
	
	/**
	 * Updates the drop menu
	 * 
	 * @param   {Array}   items   Description
	 */
	_updateMenu: function _updateMenu(items)
	{
		var menu = this.$dropMenuPopup;
		while(menu.firstChild)
			menu.removeChild(menu.firstChild);
			
		for(var i = 0, len = items.length; i < len; ++i)
		{
			var $item = DOMHelper.createDOMNodeOn(menu, "menuitem", {label: items[i].label});
			$item.addEventListener("command", items[i].func);
		}
	}, 
	
	
	/**
	 * Collects the menu items for the drop menu
	 *
	 * @param   {Object}  dropInfo  All relevent drop data
	 *
	 * @returns {Object} items
	 */
	_addDropMenuItems: function _addDropMenuItems(dropInfo)
	{
		// TODO: make this less Spidermonkey specific and everything!!!!
		var items = [];
		
		if(dropInfo.exportParent.kind === ASTObject.KIND_PROPERTY)
		{
			if(dropInfo.astObjects.length > 1)
				throw "Please don't drop so many items!"
			
			var codeGenConstructor = dropInfo.contextPlugin.getCodeGeneratorByASTObject(dropInfo.astObjects[0], dropInfo.exportParent);
				
			if(codeGenConstructor)
			{
				items.push({ label: "Use as getter function", func: this._dropMakeGetterOrSetter.bind(this, true,  dropInfo.astObjects[0], dropInfo)});
				items.push({ label: "Use as setter function", func: this._dropMakeGetterOrSetter.bind(this, false, dropInfo.astObjects[0], dropInfo)});
			}
		}
		else
		{
			var addFuncs = [];
			for(var i = 0; i < dropInfo.astObjects.length; ++i)
			{
				var codeGenConstructor = dropInfo.contextPlugin.getCodeGeneratorByASTObject(dropInfo.astObjects[i], dropInfo.exportParent);
				
				if(codeGenConstructor)
					addFuncs.push(this._dropAddAsChild.bind(this, dropInfo.astObjects[i], dropInfo));
			}
			
			if(addFuncs.length > 0)
				items.push({ label: "Add as child", func: this._callFunctions.bind(this, addFuncs)});
		}
		
		return items;
	},
	
	/**
	 * Calls all functions in the given array
	 * 
	 * @param   {Array}   funcArray   Array of functions
	 */
	_callFunctions: function _callFunctions(funcArray)
	{
		for(var i = 0, len = funcArray.length; i < len; ++i)
			funcArray[i]();
	}, 
	
	/**
	 * Creates a new object on the current selection
	 * 
	 * @returns {Export_ASTObject}   Newly created object
	 */
	createNewObject: function createNewObject()
	{
		$parentNode = null;
		if(this.selection.length > 0)
			$parentNode = this.selection[0];
		
		var exportParent = ($parentNode == null) ? this.exportAST.root : $parentNode.data;
			
		var plugin = exportParent.AST.getCodeGeneratorPlugin(Bound.currentContext);
		if(!plugin)
			throw "No plugin for context: " + Bound.currentContext;
		
		// TODO: get functions from exportParent, exportParent.sourceObject, codegen!
		var dropInfo = {
			exportParent: exportParent,
			contextPlugin: plugin,
			$parentRow: $parentNode
		}
		
		this._dropAddAsChild(null, dropInfo);
	},
	
	
	/**
	 * Drops the given data as a child row
	 *
	 * @param   {CPP_ASTObject}  srcCPPASTObject  CPP_ASTObject to drop
	 * @param   {Object}         dropInfo         All relevent drop data
	 * 
	 */
	_dropAddAsChild: function _dropAddAsChild(srcCPPASTObject, dropInfo)
	{
		try
		{
			var codeGenConstructor = dropInfo.contextPlugin.getCodeGeneratorByASTObject(srcCPPASTObject, dropInfo.exportParent);
					
			if(codeGenConstructor)
			{
				if(srcCPPASTObject)
					name = srcCPPASTObject.name
				else
				{
					name = "NewObject";
					var counter = 1;
					while(dropInfo.exportParent._childrenMap[name])
					{
						name = "NewObject" + counter;
						++counter;
					}
				}
				
				var exportASTObject = new Export_ASTObject(dropInfo.exportParent, name, srcCPPASTObject);
				dropInfo.exportParent.addChild(exportASTObject);
				exportASTObject.addCodeGenerator(new codeGenConstructor(dropInfo.contextPlugin));
				var $newRow = this.createAndAppendRow(dropInfo.$parentRow, false, exportASTObject);
				exportASTObject._exportTreeRow = $newRow;
				this.select($newRow);
				
				MainWindow.ResultTabbox.displayCodeGenResult(exportASTObject);
				
				if(dropInfo.$parentRow && !dropInfo.$parentRow.isContainerOpen)
					dropInfo.$parentRow.toggleCollapse();
			}
		} catch(e) {
			if(typeof e == "string")
				Services.prompt.alert(this.window, "Exception: " + e, e);
			else
				Services.prompt.alert(this.window, "Exception: " + e.name, e.message);
		}
	},
	
	/**
	 * Drops the given data as a getter or setter of the given exportParent.sourceObject
	 *
	 * @param   {boolean}        asGetter         True for making getter, otherwise setter
	 * @param   {CPP_ASTObject}  srcCPPASTObject  CPP_ASTObject to drop
	 * @param   {Object}         dropInfo         All relevent drop data
	 */
	_dropMakeGetterOrSetter: function _dropMakeGetterOrSetter(asGetter, data, dropInfo)
	{
		try{
			var sourceObj = dropInfo.exportParent.sourceObject;
			if(sourceObj && sourceObj instanceof CPP_FakeASTObject_Property)
			{
				if(asGetter)
					sourceObj.getter = data;
				else
					sourceObj.setter = data;
			}
		
		} catch(e) {
			if(typeof e == "string")
				Services.prompt.alert(this.window, "Exception: " + e, e);
			else
				Services.prompt.alert(this.window, "Exception: " + e.name, e.message);
		}
	},
	
	
	_checkDrag: function _checkDrag(event)
	{
		if(event.dataTransfer.types.contains("application/x-tree-data")) // TODO: use other type of data
			event.preventDefault();
	},
	
	/**
	 * Data callback for the DOMTree widget
	 * 
	 * @param   {string}    type   Type of data requested
	 * @param   {Object}    data   Data that is associated with the row (should be CPP_ASTObject)
	 * @param   {string}    row    Row for which data is requested
	 *
	 * @returns {string} Returned data
	 */
	_dataCB: function _dataCB(type, data, row)
	{
		switch(type)
		{
			case "label":
				return (data.overloadContainer && data.overloadName) ? data.overloadName : data.name;
			case "attributes" : return { ast_kind: data.getKindAsString()};
		}
		
		return "";
	},
	
	/**
	 * On click event handler
	 * 
	 * @param   {DOMEvent}   event   MouseEvent that was passed
	 */
	_onClick: function _onClick(event)
	{
		if(this.selection.length > 0)
		{
			//MainWindow.ResultTabbox.displayCodeGenResult(this.selection[0].data);
		}
	}
	
};



