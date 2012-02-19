var EXPORTED_SYMBOLS = ["initCPPTree", "getCPPTree"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/UI/Widgets/DOMTree.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/MetaDataHandler.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");

var MainWindow = null;
var document = null;

var $cppTree = null;

/**
 * Initializes the property explorer
 * 
 * @param   {Object}   mainWindowModule   JSM for the main window
 */
function initCPPTree(mainWindowModule)
{
	MainWindow = mainWindowModule;
	document = MainWindow.$document;
	
	$cppTree = document.getElementById("cppTree");
	Extension.borrow($cppTree, CPPTreePrototype);
	$cppTree = DOMTree.createOn($cppTree, $cppTree._dataCB);
	
	$cppTree.cppAST = null;
	$cppTree.addEventListener("select", $cppTree._onSelect);
	
	return $cppTree;
}

var CPPTreePrototype = {
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
		handler.handleException = CPPTreePrototype._metaHandleException;
		handler.getPropertyDataHandler = CPPTreePrototype._metaGetPropertyDataHandler;
		return handler;
	},
	
	
	/**
	 * Called when selection in the tree changed
	 * 
	 * @param   {event}   event   Description
	 */
	_onSelect: function _onSelect(event)
	{
		try{
			if(this.selection.length > 0)
			{
				var data = this.selection[0].data;
				if(this.selection.length > 1)
				{
					data = {};
					for(var i = 0, len = this.selection.length; i < len; ++i)
						data[i + ": " + this.selection[i].data.name] = this.selection[i].data;
				}
				
				
				var handler = new MetaDataHandler(data, true);
				handler.handleException = this._metaHandleException;
				handler.getPropertyDataHandler = this._metaGetPropertyDataHandler;
				MainWindow.PropertyExplorer.setDataHandler(handler);
			}
		} catch(e){
			log(e);
		}
	}, 
	
	
	astNodeToTreeNode: function astNodeToTreeNode(astNode, $parent)
	{
		if(astNode instanceof ASTOverloadContainer)
		{
			var $row = this.createAndAppendRow($parent, true, astNode);
			for(var i = 0, len = astNode.overloads.length; i < len; ++i)
				this.astNodeToTreeNode(astNode.overloads[i], $row);
		}
		else
		{
			var $row = this.createAndAppendRow($parent, astNode.children.length !== 0, astNode);
			for(var childName in astNode._childrenMap)
				this.astNodeToTreeNode(astNode._childrenMap[childName], $row);
		}
		
		return $row;
	},
	
	setCPPAST: function setCPPAST(cppAST)
	{
		this.cppAST = cppAST;
		
		this.removeAllRows();
		
		for(var childName in this.cppAST.root._childrenMap)
		{
			var child = this.cppAST.root._childrenMap[childName];
			this.astNodeToTreeNode(child, null);
		}
	},
	
	_dataCB: function dataCB(type, data, row)
	{
		switch(type)
		{
			case "label":
				return (data.overloadContainer) ? data.displayName : data.name;
			case "attributes" : return { ast_kind: data.getKindAsString()};
		}
		
		return "";
	}
}

/**
 * Returns the PropertyExplorer
 * 
 * @returns {Object}   PropertyExplorer
 */
function getCPPTree()
{
	return $cppTree;
}
