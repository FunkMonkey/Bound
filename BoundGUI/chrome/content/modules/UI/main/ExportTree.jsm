var EXPORTED_SYMBOLS = ["ExportTree"];

Components.utils.import("chrome://bound/content/modules/DOMTree.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Export_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey.jsm");

Components.utils.import("chrome://bound/content/modules/Bound.jsm");

var MainWindow = null;
var document = null;

var ExportTree = {
	
	/**
	 * Initializes the Export tree
	 * 
	 * @param   {Object}   mainWindowModule   JSM for the main window
	 */
	init: function init(mainWindowModule)
	{
		MainWindow = mainWindowModule;
		document = MainWindow.$document;
		
		this.$exportTree = document.getElementById("exportTree");
		this.$exportTree.addEventListener("dragover", checkDrag);
		this.$exportTree.addEventListener("dragenter", checkDrag);
		this.$exportTree.addEventListener("drop", onDrop.bind(this));
		this.$exportTree.addEventListener("click", exportTree_onClick.bind(this));
		
		this.$exportASTTree = new DOMTree(document, this.$exportTree, dataCB.bind(this));
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
		
		// TODO: put somewhere else
		var spidermonkeyPlugin = new Plugin_CPP_Spidermonkey();
		this.exportAST.addCodeGeneratorPlugin(spidermonkeyPlugin);
		var codeGenConstructor = spidermonkeyPlugin.getCodeGeneratorByASTObject(cppAST.root);
		this.exportAST.root.addCodeGenerator(new codeGenConstructor(spidermonkeyPlugin));
		
		// TODO: clear $exportTree
	},
	
};

function onDrop(event)
{
	var data = event.dataTransfer.mozGetDataAt("application/x-tree-data", 0).data;
	
	var $parentNode = null;
	if(event.target !== this.$exportASTTree.box)
	{
		var $parentNode = event.target.parentNode;
		while(!$parentNode.isRow)
			$parentNode = $parentNode.parentNode;
	}
	
	var exportParent = ($parentNode == null) ? this.exportAST.root : $parentNode.data;
	var exportParentCodeGen = exportParent.getCodeGenerator(Bound.currentContext);
	
	if(!exportParentCodeGen)
		return;
	
	var plugin = exportParentCodeGen.plugin;
	
	for(var i = 0; i < data.length; ++i)
	{
		var codeGenConstructor = plugin.getCodeGeneratorByASTObject(data[i], exportParentCodeGen);
		
		if(codeGenConstructor)
		{
			var exportASTObject = new Export_ASTObject(exportParent, data[i].name, data[i]);
			exportParent.addChild(exportASTObject);
			exportASTObject.addCodeGenerator(new codeGenConstructor(plugin));
			var $newRow = this.$exportASTTree.createAndAppendRow($parentNode, false, exportASTObject);
			this.$exportASTTree.select($newRow);
			
			MainWindow.ResultTabbox.displayCodeGenResult(exportASTObject);
			
			if($parentNode && !$parentNode.isContainerOpen)
				$parentNode.toggleCollapse();
		}
	}
}

function checkDrag(event)
{
	if(event.dataTransfer.types.contains("application/x-tree-data")) // TODO: use other type of data
		event.preventDefault();
}

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

function exportTree_onClick(event)
{
	if(this.$exportASTTree.selection.length > 0)
	{
		MainWindow.ResultTabbox.displayCodeGenResult(this.$exportASTTree.selection[0].data);
	}
}

