var EXPORTED_SYMBOLS = ["CPPAnalyzer"];


const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/ctypes.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Cu.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm")

var CPPAnalyzer =
{
	FilterAccess: {
		NONE:                     1,
		PRIVATE:                  2,
		PROTECTED:                3,
		PUBLIC:                   4,
		PRIVATE_PROTECTED:        5,
		PRIVATE_PUBLIC:           6,
		PROTECTED_PUBLIC:         7,
		PRIVATE_PROTECTED_PUBLIC: 8,
		ALL:                      8
	},
	
	init: function init()
	{
		this.libClang = ctypes.open(FileUtils.getFile("CurProcD", ["components", "libClang.dll"]).path);
		this.libCPPAnalyzer = ctypes.open(FileUtils.getFile("CurProcD", ["components", "CPPAnalyzer.dll"]).path);
		
		this.libCPPAnalyzer.ParserInfo = new ctypes.StructType("ParserInfo",
									[ { "astTreeJSON": ctypes.char.ptr } ]);
		
		this.libCPPAnalyzer.CharPtrArray = new ctypes.ArrayType(ctypes.char.ptr);
		this.libCPPAnalyzer.CharArray = new ctypes.ArrayType(ctypes.char);
		
		this.libCPPAnalyzer.parse_header = this.libCPPAnalyzer.declare("parse_header", ctypes.winapi_abi, this.libCPPAnalyzer.ParserInfo.ptr, ctypes.int, this.libCPPAnalyzer.CharPtrArray, this.libCPPAnalyzer.CharArray, this.libCPPAnalyzer.CharArray, ctypes.int);
		
	},
	
	
	parse_header: function parse_header(tuPath, cmdArgs, filterFile, filterName, filterAccess)
	{
		paramsArray = ["Bound", cmdArgs];
		
		var params = this.libCPPAnalyzer.CharPtrArray(paramsArray.length);
		
		for(var i = 0; i < paramsArray.length; ++i)
		{
			params[i] = ctypes.char.array()(paramsArray[i])
		}
		
		//var params = CharPtrArray([ctypes.char.array()("supertest"), ctypes.char.array()("D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp")]);
		var result = this.libCPPAnalyzer.parse_header(params.length, params, ctypes.char.array()(filterFile), ctypes.char.array()(filterName), filterAccess);
		
		var jsonStr = result.contents.astTreeJSON.readString();
		//log(jsonStr);
		
		var ASTJSON = JSON.parse(jsonStr);
		
		var obj = {
			TUPath: tuPath,
			rootJSON: ASTJSON,
			_toSave: true
		}
		
		return CPP_AST.createFromSaveObject(obj);
	}
};



