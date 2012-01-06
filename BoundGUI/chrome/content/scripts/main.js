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



var Base_ASTObjects = {};
var CPP_ASTObjects = {};
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm", Base_ASTObjects);
Cu.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm", CPP_ASTObjects);

// TMP
Cu.import("chrome://bound/content/modules/CodeGenerators/CPP_Spidermonkey.jsm");

window.addEventListener("close", Bound.quit, false); 


CPPAnalyzer.init();

var cppAST = null;
var cppASTTree = null;

var exportAST = null;
var exportASTTree = null;


function dataCB(type, data, row)
{
	switch(type)
	{
		case "label":
			return (data.overloadContainer && data.overloadName) ? data.overloadName : data.name;
		case "attributes" : return { ast_kind: Base_ASTObjects.ASTObject.getKindAsString(data.kind)};
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
		if(child instanceof Base_ASTObjects.ASTOverloadContainer)
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
	
	if(event.target === exportASTTree.box)
	{
		var newRow = exportASTTree.createAndAppendRow(null, false, data);
	}
	else
	{
		var parentNode = event.target.parentNode;
		while(!parentNode.isRow)
			parentNode = parentNode.parentNode;
			
		var newRow = exportASTTree.createAndAppendRow(parentNode, false, data);
		if(!parentNode.isContainerOpen)
			parentNode.toggleCollapse();
	}
}

function testParsing()
{
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






