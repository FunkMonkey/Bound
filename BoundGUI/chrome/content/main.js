const Cc = Components.classes;
const Ci = Components.interfaces;

function quitApp(/* in boolean */aForceQuit)
  {
	  var appStartup = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);

	  // eAttemptQuit will try to close each XUL window, but the XUL window can cancel the quit
	  // process if there is unsaved data. eForceQuit will quit no matter what.
	  var quitSeverity = aForceQuit ? Ci.nsIAppStartup.eForceQuit : Ci.nsIAppStartup.eAttemptQuit;
	  appStartup.quit(quitSeverity);
  }


window.addEventListener("close", quitApp, false); 

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

console.log("supertest");

Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/ctypes.jsm");
  
// get the "data.txt" file in the profile directory  
//var file = FileUtils.getFile("resource:app", ["application.ini"]);
let file = Components.classes["@mozilla.org/file/directory_service;1"].  
           getService(Components.interfaces.nsIProperties).  
           get("CurProcD", Components.interfaces.nsIFile);
		   
var libclangFile = file.clone();
libclangFile.append("components");
libclangFile.append("libClang.dll");
var libClangLib = ctypes.open(libclangFile.path);
		   
var cppAnalyzerFile = file.clone();
cppAnalyzerFile.append("components");
cppAnalyzerFile.append("CPPAnalyzer.dll");


let cppAnalyzerLib = ctypes.open(cppAnalyzerFile.path);

cppAnalyzerLib.ParserInfo = new ctypes.StructType("ParserInfo",
									[ { "astTreeJSON": ctypes.char.ptr } ]);

//cppAnalyzerLib.ParserInfoPtr = new ctypes.PointerType(cppAnalyzerLib.ParserInfo);

const CharPtrArray = new ctypes.ArrayType(ctypes.char.ptr);

cppAnalyzerLib.parse_header = cppAnalyzerLib.declare("parse_header", ctypes.winapi_abi, cppAnalyzerLib.ParserInfo.ptr, ctypes.int, CharPtrArray);


var params = CharPtrArray([ctypes.char.array()("supertest"), ctypes.char.array()("D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp")]);
var foo = cppAnalyzerLib.parse_header(2, params)

var jsonString = foo.contents.astTreeJSON.readString();
var json = JSON.parse(jsonString);

jsdump("" + json);


