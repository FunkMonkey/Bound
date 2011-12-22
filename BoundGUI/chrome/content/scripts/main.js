const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Cu.import("chrome://bound/content/modules/Bound.jsm");
Cu.import("chrome://bound/content/modules/CPPAnalyzer.jsm");
Cu.import("chrome://bound/content/modules/TreeData.jsm");

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

function testParsing()
{
	cppAST = CPPAnalyzer.parse_header(["supertest", "D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp"]);
	let tree = document.getElementById("cppTree");
	
	log(" " + tree);
	
	let treeView = new nsTreeView(cppAST.root.children, getCellTextCB);
	
	tree.view = treeView;
}

window.addEventListener("load", testParsing, true);






