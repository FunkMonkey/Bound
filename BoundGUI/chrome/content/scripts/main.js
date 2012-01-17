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

Components.utils.import("resource://gre/modules/Services.jsm");
Cu.import("chrome://bound/content/modules/FileIO.jsm");



var ASTObjects = {
	Base: {},
	CPP: {},
	Export: {}
}

Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm", ASTObjects.Base);
Cu.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm", ASTObjects.CPP);

Cu.import("chrome://bound/content/modules/AST/Export_ASTObjects.jsm", ASTObjects.Export);


// TMP
Components.utils.import("chrome://bound/content/modules/TemplateManager.jsm");
// adding some plugins

// TODO: move into exportASTTree as a code generator
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CodeGeneratorPluginManager.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey.jsm");
//CodeGeneratorPluginManager.registerPlugin(new Plugin_CPP_Spidermonkey());
var currentContext = "CPP_Spidermonkey";

window.addEventListener("close", Bound.quit, false); 


CPPAnalyzer.init();

var cppAST = null;
var $cppASTTree = null;

var exportAST = null;
var $exportASTTree = null;

var $resultCode = null;
var $resultTabbox = null;
var $resultTabs = null;
var $resultTabPanels = null;


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
	
	var $parentNode = null;
	if(event.target !== $exportASTTree.box)
	{
		var $parentNode = event.target.parentNode;
		while(!$parentNode.isRow)
			$parentNode = $parentNode.parentNode;
	}
	
	var exportParent = ($parentNode == null) ? exportAST.root : $parentNode.data;
	var exportParentCodeGen = exportParent.getCodeGenerator(currentContext);
	
	if(!exportParentCodeGen)
		return;
	
	var plugin = exportParentCodeGen.plugin;
	
	var codeGenConstructor = plugin.getCodeGeneratorByASTObject(data, exportParentCodeGen);
	
	if(codeGenConstructor)
	{
		var exportASTObject = new ASTObjects.Export.Export_ASTObject(exportParent, data.name, data);
		exportParent.addChild(exportASTObject);
		exportASTObject.addCodeGenerator(new codeGenConstructor(plugin));
		var $newRow = $exportASTTree.createAndAppendRow($parentNode, false, exportASTObject);
		$exportASTTree.select($newRow);
		
		printCodeGenResult(exportASTObject);
		
		if($parentNode && !$parentNode.isContainerOpen)
			$parentNode.toggleCollapse();
	}
}

/**
 * Removes all elements from the given element
 * 
 * @param   {element}   elem 
 */
function emptyDOMElement(elem)
{
	while(elem.firstChild)
		elem.removeChild(elem.firstChild);
}


function printCodeGenResult(exportASTObject)
{
	var genResult = exportASTObject.getCodeGenerator(currentContext).generate();
	
	emptyDOMElement($resultTabs);
	emptyDOMElement($resultTabPanels);
		
	
	
	if(genResult["files"])
	{
		for(var fileName in genResult["files"])
		{
			//textResult += fileName + ":\n\n" + genResult["files"][fileName] + "\n\n";
			
			var $newTab = document.createElement("tab");
			$newTab.setAttribute("label", fileName);
			$newTab.setAttribute("tooltiptext", fileName);
			$newTab.setAttribute("crop", "start");
			$resultTabs.appendChild($newTab);
			
			var $newTabPanel = document.createElement("tabpanel");
			$resultTabPanels.appendChild($newTabPanel);
			
			var $newTextbox = document.createElement("textbox");
			$newTextbox.setAttribute("flex", "1");
			$newTextbox.setAttribute("multiline", "true");
			$newTabPanel.appendChild($newTextbox);
			
			$newTextbox.value = genResult["files"][fileName];
		}
	}
	else
	{
		var $newTab = document.createElement("tab");
		$newTab.setAttribute("label", "Info");
		$resultTabs.appendChild($newTab);
		
		var $newTabPanel = document.createElement("tabpanel");
		$resultTabPanels.appendChild($newTabPanel);
		
		var $newTextbox = document.createElement("textbox");
		$newTextbox.setAttribute("flex", "1");
		$newTextbox.setAttribute("multiline", "true");
		$newTabPanel.appendChild($newTextbox);
		
		var textResult = ""
		for(var code in genResult)
		{
			textResult += code + ":\n\n" + genResult[code] + "\n\n";
		}
		
		$newTextbox.value = textResult;
	}
	
	$resultTabbox.selectedIndex = 0;
}

function exportFiles()
{
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	const nsIFile = Components.interfaces.nsIFile;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Open directory", nsIFilePicker.modeGetFolder);
	
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
	{
		var dir = fp.file;
		
		// save the files
		var genResult = exportAST.root.getCodeGenerator(currentContext).generate();
		
		if(!("files" in genResult))
			return;
		
		for(var fileName in genResult.files)
		{
			var file = dir.clone();
			var split = fileName.split("/");
			
			for(var i = 0; i < split.length; ++i)
				if(split[i] !== "")
					file.append(split[i]);
					
			if(!file.exists())
				file.create(nsIFile.NORMAL_FILE_TYPE, FileIO.PERMS_FILE);
			
			FileIO.writeTextFile(genResult.files[fileName], file);
		}
	}
}

function exportTree_onClick(event)
{
	if($exportASTTree.selection.length > 0)
	{
		printCodeGenResult($exportASTTree.selection[0].data);
	}
}

function testParsing()
{
	$resultTabbox = document.getElementById("resultTabbox");
	$resultTabs = document.getElementById("resultTabs");
	$resultTabPanels = document.getElementById("resultTabPanels");
	
	// ----- C++ -----
	cppAST = CPPAnalyzer.parse_header(["supertest", "D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp"]);
	//cppAST = CPPAnalyzer.parse_header(["supertest", "D:\\Data\\Projekte\\Bound\\src\\Wrapping\\Spidermonkey\\include\\Functions_BasicTypes.hpp"]);
	

	$cppASTTree = new DOMTree(document, document.getElementById("cppTree"), dataCB);
	
	for(var i = 0; i < cppAST.root.children.length; ++i)
	{
		var child = cppAST.root.children[i];
		astNodeToTreeNode(child, null, $cppASTTree);
	}
	
	// ----- export tree -----
	exportAST = {};
	exportAST.root = new ASTObjects.Export.Export_ASTObject(null, "wrap_Test", cppAST.root);
	
	var spidermonkeyPlugin = new Plugin_CPP_Spidermonkey();
	var codeGenConstructor = spidermonkeyPlugin.getCodeGeneratorByASTObject(cppAST.root);
	exportAST.root.addCodeGenerator(new codeGenConstructor(spidermonkeyPlugin));
	
	var $exportTree = document.getElementById("exportTree");
	$exportASTTree = new DOMTree(document, $exportTree, dataCB);
	$exportTree.addEventListener("dragover", checkDrag);
	$exportTree.addEventListener("dragenter", checkDrag);
	$exportTree.addEventListener("drop", onDrop);
	$exportTree.addEventListener("click", exportTree_onClick);
}

window.addEventListener("load", testParsing, true);





