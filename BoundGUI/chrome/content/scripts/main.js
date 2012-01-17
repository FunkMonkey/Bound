const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Cu.import("chrome://bound/content/modules/Bound.jsm");



Components.utils.import("resource://gre/modules/Services.jsm");
Cu.import("chrome://bound/content/modules/FileIO.jsm");

Components.utils.import("chrome://bound/content/modules/UI/main/MainWindow.jsm");




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

function testParsing()
{
	Bound.init(MainWindow);
	MainWindow.init(window);
}

window.addEventListener("load", testParsing, true);
window.addEventListener("close", Bound.quit, false); 





