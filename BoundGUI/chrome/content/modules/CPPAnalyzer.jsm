var EXPORTED_SYMBOLS = ["CPPAnalyzer"];


const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");
Components.utils.import("resource://gre/modules/ctypes.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Cu.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm")

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
	
	/**
	 * Creates an ASTType from JSON-data
	 * 
	 * @param   {Object}   astTree      The whole ASTObject-Tree
	 * @param   {Object}   jsonObject   The JSON-data
	 * 
	 * @returns {ASTType}   The newly created type
	 */
	createASTTypeFromJSON: function createASTTypeFromJSON(astTree, jsonObject)
	{
		let astType = new CPP_ASTType(jsonObject.kind, astTree.astObjectsByID[jsonObject.declaration], jsonObject.isConst);
		
		if(jsonObject.pointsTo)
			astType.pointsTo = this.createASTTypeFromJSON(astTree, jsonObject.pointsTo);
			
		return astType;
	}, 
	
	
	/**
	 * Summary
	 * 
	 * @param   {Object}      astTree      The whole ASTObject-Tree
	 * @param   {ASTObject}   parent       The parent ASTObject
	 * @param   {Object}      jsonObject   The JSON-data
	 *
	 * @returns {ASTObject}   The newly created object
	 */
	createASTObjectFromJSON: function createASTObjectFromJSON(astTree, parent, jsonObject)
	{
		let astObject = null;
		
		let type = null;
		let typeCanonical = null;
		
		switch(jsonObject.kind)
		{
			case "Namespace":
				astObject = new CPP_ASTObject_Namespace(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				astTree.astObjectsByID[jsonObject.id] = astObject;
				break;
			
			case "Typedef":
				type = this.createASTTypeFromJSON(astTree, jsonObject.type);
				typeCanonical = this.createASTTypeFromJSON(astTree, jsonObject.typeCanonical);
				astObject = new CPP_ASTObject_Typedef(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical);
				astTree.astObjectsByID[jsonObject.id] = astObject;
				break;
			
			case "Struct":
				astObject = new CPP_ASTObject_Struct(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				astTree.astObjectsByID[jsonObject.id] = astObject;
				
				for(let i = 0; i < jsonObject.bases.length; ++i)
					astObject.addBase(astTree.astObjectsByID[jsonObject.bases[i]], ASTObject.ACCESS_PUBLIC);
				
				break;
			
			case "Class":
				astObject = new CPP_ASTObject_Class(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				astTree.astObjectsByID[jsonObject.id] = astObject;
				
				for(let i = 0; i < jsonObject.bases.length; ++i)
					astObject.addBase(astTree.astObjectsByID[jsonObject.bases[i]], ASTObject.ACCESS_PUBLIC);
				
				break;
			
			case "VariableDeclaration":
				type = this.createASTTypeFromJSON(astTree, jsonObject.type);
				typeCanonical = this.createASTTypeFromJSON(astTree, jsonObject.typeCanonical);
				astObject = new CPP_ASTObject_Var_Decl(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical);
				astTree.astObjectsByID[jsonObject.id] = astObject;
				break;
			
			case "Field":
				type = this.createASTTypeFromJSON(astTree, jsonObject.type);
				typeCanonical = this.createASTTypeFromJSON(astTree, jsonObject.typeCanonical);
				astObject = new CPP_ASTObject_Field(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical, ASTObject.getAccessFromString(jsonObject.access));
				astTree.astObjectsByID[jsonObject.id] = astObject;
				break;
			
			case "Function":
				type = this.createASTTypeFromJSON(astTree, jsonObject.returnType);
				typeCanonical = this.createASTTypeFromJSON(astTree, jsonObject.returnTypeCanonical);
				astObject = new CPP_ASTObject_Function(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical);
				astTree.astObjectsByID[jsonObject.id] = astObject;
				
				for(let i = 0; i < jsonObject.parameters.length; ++i)
				{
					type = this.createASTTypeFromJSON(astTree, jsonObject.parameters[i].type);
					typeCanonical = this.createASTTypeFromJSON(astTree, jsonObject.parameters[i].typeCanonical);
					let param = new CPP_ASTObject_Parameter(astObject, jsonObject.parameters[i].name, type, typeCanonical);
					astObject.addParameter(param);
				}
				
				break;
			
			case "MemberFunction":
				type = this.createASTTypeFromJSON(astTree, jsonObject.returnType);
				typeCanonical = this.createASTTypeFromJSON(astTree, jsonObject.returnTypeCanonical);
				astObject = new CPP_ASTObject_Member_Function(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical, ASTObject.getAccessFromString(jsonObject.access), false, false);
				astTree.astObjectsByID[jsonObject.id] = astObject;
				
				for(let i = 0; i < jsonObject.parameters.length; ++i)
				{
					type = this.createASTTypeFromJSON(astTree, jsonObject.parameters[i].type);
					typeCanonical = this.createASTTypeFromJSON(astTree, jsonObject.parameters[i].typeCanonical);
					let param = new CPP_ASTObject_Parameter(astObject, jsonObject.parameters[i].name, type, typeCanonical);
					astObject.addParameter(param);
				}
				
				break;	
				
			case "Parameter":
				break;
			
			case "Constructor":
				astObject = new CPP_ASTObject_Constructor(parent, jsonObject.name, jsonObject.id, jsonObject.USR, ASTObject.getAccessFromString(jsonObject.access));
				astTree.astObjectsByID[jsonObject.id] = astObject;
				
				for(let i = 0; i < jsonObject.parameters.length; ++i)
				{
					type = this.createASTTypeFromJSON(astTree, jsonObject.parameters[i].type);
					typeCanonical = this.createASTTypeFromJSON(astTree, jsonObject.parameters[i].typeCanonical);
					let param = new CPP_ASTObject_Parameter(astObject, jsonObject.name, type, typeCanonical);
					astObject.addParameter(param);
				}
				
				break;	
				
			case "Destructor":
				astObject = new CPP_ASTObject_Destructor(parent, jsonObject.name, jsonObject.id, jsonObject.USR, ASTObject.getAccessFromString(jsonObject.access), false);
				astTree.astObjectsByID[jsonObject.id] = astObject;
				break;	
		}
		
		if(jsonObject.children)
		{
			for(let i = 0; i < jsonObject.children.length; ++i)
				astObject.addChild(this.createASTObjectFromJSON(astTree, astObject, jsonObject.children[i]));
		}
		
		return astObject;
	}, 
	
	
	/**
	 * Takes an AST in form of JSON and returns an AST made of ASTObjects
	 * 
	 * @param   {Object}   json   JSON-input
	 * 
	 * @returns {Object}   ASTObjects
	 */
	astJSONtoASTObjects: function astJSONtoASTObjects(json)
	{
		let result = {};
		result.astObjectsByID = {};
		result.root = this.createASTObjectFromJSON(result, null, json);
		
		return result;
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
		
		let resultJSON = JSON.parse(result.contents.astTreeJSON.readString());
		
		return this.astJSONtoASTObjects(resultJSON);
	}
};



