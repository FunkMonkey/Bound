var EXPORTED_SYMBOLS = ["initExportTree", "getExportTree"];


Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/DOMTree.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Export_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey.jsm");

Components.utils.import("chrome://bound/content/modules/Bound.jsm");


Components.utils.import("chrome://bound/content/modules/MetaDataHandler.jsm");

Components.utils.import("chrome://bound/content/modules/ForwardProxy.jsm");
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://bound/content/modules/Extension.jsm");

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
	$exportTree.addEventListener("select", $exportTree._onSelect);
	$exportTree.addEventListener("keypress", $exportTree._onKeyUp)
	
	return $exportTree;
}

var ExportTreePrototype = {
	
	_proxySet: function _proxySet(receiver, name, val) {
		
		this.obj[name] = val;
		if(name === "name")
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
		if(typeof e == "string")
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
	 * @param   {event}   event   Event
	 */
	_onSelect: function _onSelect(event)
	{
		//this.$exportASTTree.focus();
		if(this.selection.length > 0)
		{
			var proxyHandler = new ForwardProxyHandler(this.selection[0].data);
			proxyHandler.set = this._proxySet;
			var proxy = Proxy.create(proxyHandler, Object.getPrototypeOf(proxyHandler.obj));
			var handler = new MetaDataHandler(proxy);
			handler.handleException = this._metaHandleException;
			handler.getPropertyDataHandler = this._metaGetPropertyDataHandler;
			MainWindow.PropertyExplorer.setDataHandler(handler);
		}
	},
	
	/**
	 * Called when a key goes up
	 * 
	 * @param   {event}   event   Event
	 */
	_onKeyUp: function _onKeyUp(event)
	{
		if(this.selection.length > 0)
		{
			if(event.keyCode == 46)
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
	 * Creates a new export AST based on the given C++ AST
	 * 
	 * @param   {CPP_AST}   cppAST   C++ AST
	 */
	newExportAST: function newExportAST(cppAST)
	{
		/*this.exportAST = {}; // TODO: move into Export_ASTObjects.jsm
		this.exportAST.root = new Export_ASTObject(null, "wrap_Test", cppAST.root); // TODO: rootNodeName
		this.exportAST.root._AST = this.exportAST;*/
		this.exportAST = new Export_AST("wrap_Test");
		this.exportAST.root.sourceObject = cppAST.root;
		this.exportAST.inputAST = cppAST;
		
		// TODO: put somewhere else
		var spidermonkeyPlugin = new Plugin_CPP_Spidermonkey();
		this.exportAST.addCodeGeneratorPlugin(spidermonkeyPlugin);
		var codeGenConstructor = spidermonkeyPlugin.getCodeGeneratorByASTObject(cppAST.root);
		this.exportAST.root.addCodeGenerator(new codeGenConstructor(spidermonkeyPlugin));
		
		// TODO: clear $exportTree
	},
	
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
			
			//var exportParentCodeGen = exportParent.getCodeGenerator(Bound.currentContext);
			
			//if(!exportParentCodeGen)
			//	return;
			
			for(var i = 0; i < data.length; ++i)
			{
				var codeGenConstructor = plugin.getCodeGeneratorByASTObject(data[i], exportParent);
				
				if(codeGenConstructor)
				{
					var exportASTObject = new Export_ASTObject(exportParent, data[i].name, data[i]);
					exportParent.addChild(exportASTObject);
					exportASTObject.addCodeGenerator(new codeGenConstructor(plugin));
					var $newRow = this.createAndAppendRow($parentNode, false, exportASTObject);
					exportASTObject._exportTreeRow = $newRow;
					this.select($newRow);
					
					MainWindow.ResultTabbox.displayCodeGenResult(exportASTObject);
					
					if($parentNode && !$parentNode.isContainerOpen)
						$parentNode.toggleCollapse();
				}
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
	
	_onClick: function _onClick(event)
	{
		if(this.selection.length > 0)
		{
			MainWindow.ResultTabbox.displayCodeGenResult(this.selection[0].data);
		}
	}
	
};



