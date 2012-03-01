
var EXPORTED_SYMBOLS = ["CPP_ASTType",
						"CPP_ASTFunctionType"];

Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");

//======================================================================================   

/*
Existing type kinds:
  CXType_Invalid = 0,
  CXType_Unexposed = 1,

  // Builtin types
  CXType_Void = 2,
  CXType_Bool = 3,
  CXType_Char_U = 4,
  CXType_UChar = 5,
  CXType_Char16 = 6,
  CXType_Char32 = 7,
  CXType_UShort = 8,
  CXType_UInt = 9,
  CXType_ULong = 10,
  CXType_ULongLong = 11,
  CXType_UInt128 = 12,
  CXType_Char_S = 13,
  CXType_SChar = 14,
  CXType_WChar = 15,
  CXType_Short = 16,
  CXType_Int = 17,
  CXType_Long = 18,
  CXType_LongLong = 19,
  CXType_Int128 = 20,
  CXType_Float = 21,
  CXType_Double = 22,
  CXType_LongDouble = 23,
  CXType_NullPtr = 24,
  CXType_Overload = 25,
  CXType_Dependent = 26,
  CXType_ObjCId = 27,
  CXType_ObjCClass = 28,
  CXType_ObjCSel = 29,

  CXType_Complex = 100,
  CXType_Pointer = 101,
  CXType_BlockPointer = 102,
  CXType_LValueReference = 103,
  CXType_RValueReference = 104,
  CXType_Record = 105,
  CXType_Enum = 106,
  CXType_Typedef = 107,
  CXType_ObjCInterface = 108,
  CXType_ObjCObjectPointer = 109,
  CXType_FunctionNoProto = 110,
  CXType_FunctionProto = 111,
  CXType_ConstantArray = 112,
  CXType_Vector = 113,
  CXType_TemplateTypeParm = 114,
  CXType_TemplateSpecialization = 115,
  CXType_Elaborated = 116
 
*/

/**
 * CPP_ASTType
 *
 * @constructor
 * @this {CPP_ASTType}
 */
function CPP_ASTType(kind, id)
{
	this.kind = kind;
	this.id = id;
	
	this.declaration = null;
	this.pointsTo = null;
	this.isConst = false;
	this.canonicalType = null;
};

CPP_ASTType.prototype = {
	constructor: CPP_ASTType,
	
	/**
	 * True if type is a builtin type, otherwise false
	 * 
	 * @returns {boolean}
	 */
	isBuiltIn: function isBuiltIn()
	{
		switch(this.kind)
		{
			case "Void":
			case "Bool":
			case "Char_U":
			case "UChar":
			case "Char16":
			case "Char32":
			case "UShort":
			case "UInt":
			case "ULong":
			case "ULongLong":
			case "UInt128":
			case "Char_S":
			case "SChar":
			case "WChar":
			case "Short":
			case "Int":
			case "Long":
			case "LongLong":
			case "Int128":
			case "Float":
			case "Double":
			case "LongDouble":
			case "NullPtr":
			case "Overload":
			case "Dependent":
			case "ObjCId":
			case "ObjCClass":
			case "ObjCSel":
				return true;
			default: return false;
		}
	},
			
			
	// taken from http://clang.llvm.org/doxygen/MicrosoftMangle_8cpp_source.html
	_fundamentalTypeCodes: {
		"Void":      "void",
		"Bool":      "bool",
		"Char_U":    "char", // ???
		"UChar":     "unsigned char",
		"Char16":    "char16_t",
		"Char32":    "char32_t",
		"UShort":    "unsigned short",
		"UInt":      "unsigned int",
		"ULong":     "unsigned long",
		"ULongLong": "unsigned long long",
		"UInt128":   "unsigned __int128",
		"Char_S":    "char", // ???
		"SChar":     "signed char",
		"WChar":     "wchar_t",
		"Short":     "short",
		"Int":       "int",
		"Long":      "long",
		"LongLong":  "long long",
		"Int128":    "__int128",
		"Float":     "float",
		"Double":    "double",
		"LongDouble":"long double"
	},
	
	get isCanonical(){ return (this.canonicalType == null);},
	
	/**
	 * Returns the type as its C++ code
	 * 
	 * @returns {String} 
	 */
	getAsCPPCode: function getAsCPPCode()
	{
		if(this.declaration)
		{
			return "INVALID";
		}
		else if(this.pointsTo)
		{
			return "INVALID";
		}
		else if(this._fundamentalTypeCodes[this.kind])
		{
			return ((this.isConst == true) ? "const " : "") + this._fundamentalTypeCodes[this.kind];
		}
		else return "INVALID";
	}, 
	
};

MetaData.initMetaDataOn(CPP_ASTType.prototype)
   .addPropertyData("kind",          {view: {}})
   .addPropertyData("declaration",   {view: {}})
   .addPropertyData("pointsTo",      {view: {}})
   .addPropertyData("isConst",       {view: {}})
   .addPropertyData("canonicalType", {view: {}})
   
//======================================================================================   
   
/**
 * CPP_ASTFunctionType
 *
 * @constructor
 * @this {CPP_ASTFunctionType}
 */
function CPP_ASTFunctionType(kind, id)
{
	CPP_ASTType.call(this, kind, id);
	
	this.parameters = [];
};

CPP_ASTFunctionType.prototype = {
	constructor: CPP_ASTFunctionType,
	
};

Extension.inherit(CPP_ASTFunctionType, CPP_ASTType);

MetaData.initMetaDataOn(CPP_ASTFunctionType.prototype)
   .addPropertyData("parameters",            {view: {}})



//======================================================================================