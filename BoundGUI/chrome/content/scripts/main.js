const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Bound.jsm");

Components.utils.import("chrome://bound/content/modules/UI/main/MainWindow.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/CPPTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ExportTree.jsm");
Components.utils.import("chrome://bound/content/modules/UI/main/ResultTabbox.jsm");

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/FileIO.jsm");

Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Export_ASTObjects.jsm");



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
		var genResult = ExportTree.exportAST.root.getCodeGenerator(Bound.currentContext).generate();
		
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

function saveProject()
{
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	const nsIFile = Components.interfaces.nsIFile;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Open directory", nsIFilePicker.modeSave);
	
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
	{
		var projectFile = fp.file;
		var projectFileSplit = projectFile.leafName.split(".");
		
		// save the project
		var projectSaveData = JSON.stringify(ExportTree.exportAST.toSaveObject());
		FileIO.writeTextFile(projectSaveData, projectFile);
		
		// save the CPP AST
		if(CPPTree.cppAST._toSave)
		{
			var cppASTFile = projectFile.parent.clone();
			cppASTFile.append(projectFileSplit[0] + "_CPP_AST.json");
			
			var cppASTSaveData = JSON.stringify(CPPTree.cppAST.toSaveObject());
			FileIO.writeTextFile(cppASTSaveData, cppASTFile);
		}
	}
}

function loadProject()
{
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	const nsIFile = Components.interfaces.nsIFile;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Open directory", nsIFilePicker.modeOpen);
	
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
	{
		var projectFile = fp.file;
		var projectFileSplit = projectFile.leafName.split(".");
		
		// load the CPP AST
		var cppASTFile = projectFile.parent.clone();
		cppASTFile.append(projectFileSplit[0] + "_CPP_AST.json");
		
		var cppJSONStr = FileIO.readTextFile(cppASTFile);
		var cppAST = CPP_AST.createFromSaveObject(JSON.parse(cppJSONStr));
		CPPTree.setCPPAST(cppAST);
		
		// load the project
		var projectJSONStr = FileIO.readTextFile(projectFile);
		var exportAST = Export_AST.createFromSaveObject(JSON.parse(projectJSONStr), CPPTree.cppAST);
		ExportTree.setExportAST(exportAST);
		
		// fill the trees
	}
}

function init()
{
	Bound.init(MainWindow);
	MainWindow.init(window);
}

window.addEventListener("load", init, true);
window.addEventListener("close", Bound.quit, false); 





