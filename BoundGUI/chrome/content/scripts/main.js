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

	// TODO: don't use spidermonkey path	
	var lastFolder = Services.prefs.getCharPref("bound.plugin.CPP_Spidermonkey.lastExportFolder");
	if(lastFolder)
	{
		var localFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		localFile.initWithPath(lastFolder);
		fp.displayDirectory = localFile;
	}
	
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
	{
		var dir = fp.file;
		Services.prefs.setCharPref("bound.plugin.CPP_Spidermonkey.lastExportFolder", fp.file.path);
		
		// save the files
		var codeGen = MainWindow.ExportTree.exportAST.root.getCodeGenerator(Bound.currentContext);
		
		if(!codeGen.prepareAndDiagnose(true))
		{
			alert("Error exporting!");
			return;
		}
		
		// TODO: remove the second prepareAndDiagnose
		codeGen.prepareAndDiagnose(true);
		var genResult = codeGen.generate();
		var exportFiles = codeGen.plugin.getExportFiles(genResult);
		
		if(!exportFiles)
			return;
		
		for(var fileName in exportFiles)
		{
			var file = dir.clone();
			var split = fileName.split("/");
			
			for(var i = 0; i < split.length; ++i)
				if(split[i] !== "")
					file.append(split[i]);
					
			if(!file.exists())
				file.create(nsIFile.NORMAL_FILE_TYPE, FileIO.PERMS_FILE);
			
			FileIO.writeTextFile(exportFiles[fileName], file);
		}
	}
}

function saveProject()
{
	const nsIFilePicker = Components.interfaces.nsIFilePicker;
	const nsIFile = Components.interfaces.nsIFile;

	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Open directory", nsIFilePicker.modeSave);
	fp.defaultExtension = "json";
	fp.appendFilter("JSON project file", "*.json");
	
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
	fp.defaultExtension = "json";
	fp.appendFilter("JSON project file", "*.json");
	
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
	try
	{
		Bound.reparseCurrentProject();
		MainWindow.CPPTree.setCPPAST(Bound.currentProject.cppAST);
		MainWindow.ExportTree.setExportAST(Bound.currentProject.exportAST);
		MainWindow.LogBox.showMessagesFromCPPAST(Bound.currentProject.cppAST);
	}
	catch(e)
	{
		log(e);
	}
	
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





