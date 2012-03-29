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
/**
 * Prototype used for the CPPTree
 * @type Object
 */
var CPPTreePrototype = {
	/**
	 * Handles exceptions for the given property
	 * 
	 * @param   {string}      propertyName   Name of the property
	 * @param   {Error}       e              Caught exception
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
	 * @param   {string}   propertyName   Name of the property
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
	 * @param   {DOMEvent}   event   Passed event
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
						
					MainWindow.PropertyExplorer.$label.value = "Inspecting: <collection>";
				}
				else
					MainWindow.PropertyExplorer.$label.value = "Inspecting: " + data.name;
				
				var handler = new MetaDataHandler(data, true);
				handler.handleException = this._metaHandleException;
				handler.getPropertyDataHandler = this._metaGetPropertyDataHandler;
				MainWindow.PropertyExplorer.setDataHandler(handler);
				
			}
		} catch(e){
			//if(e.constructor)
			//{
			//	switch(e.constructor.name)
			//	{
			//		case "TypeError": var newE =  new TypeError(e.message, e.fileName, e.lineNumber); newE.stack = e.stack; throw newE;
			//	}
			//}
			
			log(e + " " + e.fileName + " " + e.lineNumber)
			log(e.stack);
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
	
	/**
	 * Sets the C++ tree
	 * 
	 * @param   {CPP_AST}    cppAST   AST to set
	 */
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
	
	/**
	 * Data callback for the DOMTree widget
	 * 
	 * @param   {string}    type   Type of data requested
	 * @param   {Object}    data   Data that is associated with the row (should be CPP_ASTObject)
	 * @param   {string}    row    Row for which data is requested
	 *
	 * @returns {string} Returned data
	 */
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
 * Returns the C++ DOMTree
 * 
 * @returns {DOMTree}   The tree
 */
function getCPPTree()
{
	return $cppTree;
}
