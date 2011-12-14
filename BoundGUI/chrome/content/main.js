function showMore() {
  document.getElementById("more-text").hidden = false;
}

function jsdump(str)
{
  Components.classes['@mozilla.org/consoleservice;1']
            .getService(Components.interfaces.nsIConsoleService)
            .logStringMessage(str);
}

jsdump("test");

Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/ctypes.jsm");
  
// get the "data.txt" file in the profile directory  
//var file = FileUtils.getFile("resource:app", ["application.ini"]);
var file = Components.classes["@mozilla.org/file/directory_service;1"].  
           getService(Components.interfaces.nsIProperties).  
           get("CurProcD", Components.interfaces.nsIFile);
		   
alert(file.path)
		   
var libclangFile = file.clone();
libclangFile.append("components");
libclangFile.append("libClang.dll");
var libClangLib = ctypes.open(libclangFile.path);
		   
var cppAnalyzerFile = file.clone();
cppAnalyzerFile.append("components");
cppAnalyzerFile.append("CPPAnalyzer.dll");


var cppAnalyzerLib = ctypes.open(cppAnalyzerFile.path);

