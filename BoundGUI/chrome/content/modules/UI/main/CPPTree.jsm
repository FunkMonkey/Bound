var EXPORTED_SYMBOLS = ["CPPTree"];

Components.utils.import("chrome://bound/content/modules/DOMTree.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");

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
		
		this.$cppASTTree = new DOMTree(document, document.getElementById("cppTree"), dataCB);
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
		
		// TODO: clear $cppASTTree
		
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