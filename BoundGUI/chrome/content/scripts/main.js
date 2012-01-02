const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Cu.import("chrome://bound/content/modules/Bound.jsm");
Cu.import("chrome://bound/content/modules/CPPAnalyzer.jsm");
Cu.import("chrome://bound/content/modules/TreeData.jsm");

Cu.import("chrome://bound/content/modules/jSmart.jsm");

Cu.import("chrome://bound/content/modules/DOMTree.jsm");

let CPP_ASTObjects = {};
Cu.import("chrome://bound/content/modules/CPP_ASTObjects.jsm", CPP_ASTObjects);

window.addEventListener("close", Bound.quit, false); 


CPPAnalyzer.init();

var cppAST = null;
var cppASTTree = null;


function dataCB(type, data, row)
{
	switch(type)
	{
		case "label":  return data.name;
		case "attributes" : return { ast_kind: CPP_ASTObjects.ASTObject.getKindAsString(data.kind)};
	}
	
	return "";
}

function jSmartTest()
{
	let template = new jSmart("void {$funcName}();");
	let res = template.fetch({funcName: "SuperFunc"});
	
	log("template: " + res);
	
	
}

function addAfterSelection()
{
	let obj = { name: "ADDED", kind: CPP_ASTObjects.ASTObject.KIND_CLASS}
	
	if(cppASTTree.selection.length > 0)
	{
		let parent = cppASTTree.selection[0];
		let newRow = cppASTTree.createAndAppendRow(parent, false, obj);
		if(!parent.isContainerOpen)
			parent.toggleCollapse();
			
		newRow.tree.select(newRow);
	}
	
	//jSmartTest();
}

function astNodeToTreeNode(astNode, domParent, treeView)
{
	var row = treeView.createAndAppendRow(domParent, astNode.children.length !== 0, astNode);	
	
	for(let i = 0; i < astNode.children.length; ++i)
	{
		astNodeToTreeNode(astNode.children[i], row, treeView);
	}
	
	return row;
}

function testParsing()
{
	cppAST = CPPAnalyzer.parse_header(["supertest", "D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp"]);
	let tree = document.getElementById("cppTree");
	
	
	cppASTTree = new DOMTree(document, tree, dataCB);
	
	for(let i = 0; i < cppAST.root.children.length; ++i)
	{
		let child = cppAST.root.children[i];
		astNodeToTreeNode(child, null, cppASTTree);
	}
}

window.addEventListener("load", testParsing, true);






