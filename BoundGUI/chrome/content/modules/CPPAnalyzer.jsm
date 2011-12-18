var EXPORTED_SYMBOLS = ["CPPAnalyzer"];


const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;


Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/ctypes.jsm");

let CPPAnalyzer =
{
	init: function init()
	{
		this.libClang = ctypes.open(FileUtils.getFile("CurProcD", ["components", "libClang.dll"]).path);
		this.libCPPAnalyzer = ctypes.open(FileUtils.getFile("CurProcD", ["components", "CPPAnalyzer.dll"]).path);
		
		this.libCPPAnalyzer.ParserInfo = new ctypes.StructType("ParserInfo",
									[ { "astTreeJSON": ctypes.char.ptr } ]);
		
		this.libCPPAnalyzer.CharPtrArray = new ctypes.ArrayType(ctypes.char.ptr);
		
		this.libCPPAnalyzer.parse_header = this.libCPPAnalyzer.declare("parse_header", ctypes.winapi_abi, this.libCPPAnalyzer.ParserInfo.ptr, ctypes.int, this.libCPPAnalyzer.CharPtrArray);
		
	},
	
	parse_header: function parse_header(cmdParams)
	{
		let params = this.libCPPAnalyzer.CharPtrArray(cmdParams.length);
		
		for(let i = 0; i < cmdParams.length; ++i)
		{
			params[i] = ctypes.char.array()(cmdParams[i])
		}
		
		//let params = CharPtrArray([ctypes.char.array()("supertest"), ctypes.char.array()("D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp")]);
		let result = this.libCPPAnalyzer.parse_header(params.length, params)
		
		return JSON.parse(result.contents.astTreeJSON.readString());
	}
};

  
// get the "data.txt" file in the profile directory  
//var file = FileUtils.getFile("resource:app", ["application.ini"]);
//let file = Components.classes["@mozilla.org/file/directory_service;1"].  
//           getService(Components.interfaces.nsIProperties).  
//           get("CurProcD", Components.interfaces.nsIFile);
//		   
//var libclangFile = file.clone();
//libclangFile.append("components");
//libclangFile.append("libClang.dll");
//var libClangLib = ctypes.open(libclangFile.path);
//		   
//var cppAnalyzerFile = file.clone();
//cppAnalyzerFile.append("components");
//cppAnalyzerFile.append("CPPAnalyzer.dll");
//
//
//let cppAnalyzerLib = ctypes.open(cppAnalyzerFile.path);
//
//cppAnalyzerLib.ParserInfo = new ctypes.StructType("ParserInfo",
//									[ { "astTreeJSON": ctypes.char.ptr } ]);
//
////cppAnalyzerLib.ParserInfoPtr = new ctypes.PointerType(cppAnalyzerLib.ParserInfo);




