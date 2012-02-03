var EXPORTED_SYMBOLS = ["CPPTree"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/DOMTree.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/MetaDataHandler.jsm");

var MainWindow = null;
var document = null;

var CPPTree = {
	
	/**
	 * Initializes the Export tree
	 * 
	 * @param   {Object}   mainWindowModule   JSM for the main window
	 */
	init: function init(mainWindowModule)
	{
		MainWindow = mainWindowModule;
		document = MainWindow.$document;
		
		this.cppAST = null;
		
		this.$cppASTTree = DOMTree.createOn(document.getElementById("cppTree"), dataCB);
		this.$cppASTTree.addEventListener("select", this._onSelect.bind(this));
	},
	
	/**
	 * Called when selection in the tree changed
	 * 
	 * @param   {event}   event   Description
	 */
	_onSelect: function _onSelect(event)
	{
		if(this.$cppASTTree.selection.length > 0)
		{
			var handler = new MetaDataHandler(this.$cppASTTree.selection[0].data, MainWindow.$window, true);
			MainWindow.PropertyExplorer.setDataHandler(handler);
		}
	}, 
	
	
	astNodeToTreeNode: function astNodeToTreeNode(astNode, domParent, treeView)
	{
		var row = treeView.createAndAppendRow(domParent, astNode.children.length !== 0, astNode);	
		
		for(var childName in astNode._childrenMap)
		{
			var child = astNode._childrenMap[childName];
			
			// handle overloads
			if(child instanceof ASTOverloadContainer)
			{
				var sameNameRow = treeView.createAndAppendRow(row, true, child);
				
				for(var i = 0; i < child.overloads.length; ++i)
				{
					this.astNodeToTreeNode(child.overloads[i], sameNameRow, treeView);
				}
			}
			else
			{
				this.astNodeToTreeNode(child, row, treeView);
			}
		}
		
		return row;
	},
	
	setCPPAST: function setCPPAST(cppAST)
	{
		this.cppAST = cppAST;
		
		this.$cppASTTree.removeAllRows();
		
		for(var i = 0; i < this.cppAST.root.children.length; ++i)
		{
			var child = this.cppAST.root.children[i];
			this.astNodeToTreeNode(child, null, this.$cppASTTree);
		}
	}, 
	
	
};

function dataCB(type, data, row)
{
	switch(type)
	{
		case "label":
			return (data.overloadContainer && data.overloadName) ? data.overloadName : data.name;
		case "attributes" : return { ast_kind: data.getKindAsString()};
	}
	
	return "";
}