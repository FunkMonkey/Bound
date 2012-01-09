const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Cu.import("chrome://bound/content/modules/Bound.jsm");
Cu.import("chrome://bound/content/modules/CPPAnalyzer.jsm");
Cu.import("chrome://bound/content/modules/TreeData.jsm");

Cu.import("chrome://bound/content/modules/jSmart.jsm");

Cu.import("chrome://bound/content/modules/DOMTree.jsm");

Cu.import("chrome://bound/content/modules/Extension.jsm");



var ASTObjects = {
	Base: {},
	CPP: {},
	Export: {}
}

Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm", ASTObjects.Base);
Cu.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm", ASTObjects.CPP);

Cu.import("chrome://bound/content/modules/AST/Export_ASTObjects.jsm", ASTObjects.Export);


// TMP
// adding some plugins

// TODO: move into exportASTTree as a code generator
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CodeGeneratorPluginManager.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey.jsm");
CodeGeneratorPluginManager.registerPlugin(new Plugin_CPP_Spidermonkey());
var currentContext = "CPP_Spidermonkey";

window.addEventListener("close", Bound.quit, false); 


CPPAnalyzer.init();

var cppAST = null;
var cppASTTree = null;

var exportAST = null;
var exportASTTree = new ASTObjects.Export.Export_ASTObject(null, "root", null);

var $resultCode = null;


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


function jSmartTest()
{
	if(cppASTTree.selection.length > 0)
	{
		var row = cppASTTree.selection[0];
		var data = row.data;
		
		log(Plugin_CPP_Spidermonkey.getCodeGeneratorByASTObject(data));
	}
}

function addAfterSelection()
{
	//var obj = { name: "ADDED", kind: Base_ASTObjects.ASTObject.KIND_CLASS}
	//
	//if(cppASTTree.selection.length > 0)
	//{
	//	var parent = cppASTTree.selection[0];
	//	var newRow = cppASTTree.createAndAppendRow(parent, false, obj);
	//	if(!parent.isContainerOpen)
	//		parent.toggleCollapse();
	//		
	//	newRow.tree.select(newRow);
	//}
	
	jSmartTest();
}

function astNodeToTreeNode(astNode, domParent, treeView)
{
	var row = treeView.createAndAppendRow(domParent, astNode.children.length !== 0, astNode);	
	
	for(var childName in astNode._childrenMap)
	{
		var child = astNode._childrenMap[childName];
		
		// handle overloads
		if(child instanceof ASTObjects.Base.ASTOverloadContainer)
		{
			var sameNameRow = treeView.createAndAppendRow(row, true, child);
			
			for(var i = 0; i < child.overloads.length; ++i)
			{
				astNodeToTreeNode(child.overloads[i], sameNameRow, treeView);
			}
		}
		else
		{
			astNodeToTreeNode(child, row, treeView);
		}
	}
	
	return row;
}

function checkDrag(event)
{
	if(event.dataTransfer.types.contains("application/x-tree-data"))
		event.preventDefault();
}

function onDrop(event)
{
	var data = event.dataTransfer.mozGetDataAt("application/x-tree-data", 0);
	
	var plugin = CodeGeneratorPluginManager.getPlugin(currentContext);
	var codeGenConstructor = plugin.getCodeGeneratorByASTObject(data);
	
	if(codeGenConstructor)
	{
		var parentNode = null;
		if(event.target !== exportASTTree.box)
		{
			var parentNode = event.target.parentNode;
			while(!parentNode.isRow)
				parentNode = parentNode.parentNode;
		}
		
		var exportASTObject = new ASTObjects.Export.Export_ASTObject(((parentNode == null) ? exportASTTree : parentNode.data), data.name, data);
		exportASTObject.addCodeGenerator(new codeGenConstructor(plugin));
		var newRow = exportASTTree.createAndAppendRow(parentNode, false, exportASTObject);
		
		$resultCode.value = exportASTObject.getCodeGenerator(currentContext).generate();
		
		
		
		if(parentNode && !parentNode.isContainerOpen)
			parentNode.toggleCollapse();
	}
	
	
}

function testParsing()
{
	$resultCode = document.getElementById("resultCode");	
	
	cppAST = CPPAnalyzer.parse_header(["supertest", "D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp"]);

	var $exportTree = document.getElementById("exportTree");
	exportASTTree = new DOMTree(document, $exportTree, dataCB);
	$exportTree.addEventListener("dragover", checkDrag);
	$exportTree.addEventListener("dragenter", checkDrag);
	$exportTree.addEventListener("drop", onDrop);
	
	cppASTTree = new DOMTree(document, document.getElementById("cppTree"), dataCB);
	
	for(var i = 0; i < cppAST.root.children.length; ++i)
	{
		var child = cppAST.root.children[i];
		astNodeToTreeNode(child, null, cppASTTree);
	}
}

window.addEventListener("load", testParsing, true);






