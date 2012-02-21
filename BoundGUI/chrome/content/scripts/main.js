const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Bound.jsm");

Components.utils.import("chrome://bound/content/modules/UI/main/MainWindow.jsm");

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/FileIO.jsm");

Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Export_ASTObjects.jsm");


Components.utils.import("chrome://bound/content/modules/Project/Project.jsm");

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
		var genResult = MainWindow.ExportTree.exportAST.root.getCodeGenerator(Bound.currentContext).generate();
		
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
		Bound.currentProject.saveToFile(fp.file);
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
		Bound.currentProject = Project.loadFromFile(fp.file);
		
		// fill the trees
		MainWindow.CPPTree.setCPPAST(Bound.currentProject.cppAST);
		MainWindow.ExportTree.setExportAST(Bound.currentProject.exportAST);
		MainWindow.LogBox.showMessagesFromCPPAST(Bound.currentProject.cppAST);
	}
}

function reparseCurrentProject()
{
	Bound.reparseCurrentProject();
	MainWindow.CPPTree.setCPPAST(Bound.currentProject.cppAST);
	MainWindow.ExportTree.setExportAST(Bound.currentProject.exportAST);
	MainWindow.LogBox.showMessagesFromCPPAST(Bound.currentProject.cppAST);
}

function init()
{
	Bound.init(MainWindow);
	
	var projectOptions = Bound.currentProject.options;
	
	/*var path = "D:/Data/Projekte/Bound/src/CPPAnalyzer/Test/";
	projectOptions.clangArguments = path + "SimpleClass.hpp";
	
	Bound.reparseCurrentProject();*/
	
	MainWindow.init(window);
}

window.addEventListener("load", init, true);
window.addEventListener("close", Bound.quit, false); 





