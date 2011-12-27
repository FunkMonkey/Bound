const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Cu.import("chrome://bound/content/modules/Bound.jsm");
Cu.import("chrome://bound/content/modules/CPPAnalyzer.jsm");
Cu.import("chrome://bound/content/modules/TreeData.jsm");

Cu.import("chrome://bound/content/modules/DOMTree.jsm");

let CPP_ASTObjects = {};
Cu.import("chrome://bound/content/modules/CPP_ASTObjects.jsm", CPP_ASTObjects);

window.addEventListener("close", Bound.quit, false); 


CPPAnalyzer.init();

var cppAST = null;

function getCellTextCB(item, row, col)
{
	if(!item){
		return "error";
	}
	
	if(item.data.name != "")
		return item.data.kind + " " + item.data.name;
	else
		return "<anonymous>";
}

function dataCB(type, data, row)
{
	switch(type)
	{
		case "label":  return data.name;
		case "attributes" : return { ast_kind: CPP_ASTObjects.ASTObject.getKindAsString(data.kind)};
	}
	
	return "";
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
	
	log(" " + tree);
	
	//let treeView = new nsTreeView(cppAST.root.children, getCellTextCB);
	
	//tree.view = treeView;
	
	let treeView = new DOMTree(document, tree, dataCB);
	
	for(let i = 0; i < cppAST.root.children.length; ++i)
	{
		let child = cppAST.root.children[i];
		//treeView.createAndAppendRow(null, child.children.length !== 0, child);
		astNodeToTreeNode(child, null, treeView);
	}
}

window.addEventListener("load", testParsing, true);






