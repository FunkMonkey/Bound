
var EXPORTED_SYMBOLS = ["CPP_AST",
						"CPP_ASTObject",
						"CPP_ASTType",
						"CPP_ASTObject_Namespace",
						"CPP_ASTObject_Struct",
						"CPP_ASTObject_Class",
						"CPP_ASTObject_Typedef",
						"CPP_ASTObject_Var_Decl",
						"CPP_ASTObject_Field",
						"CPP_ASTObject_Parameter",
						"CPP_ASTObject_Function",
						"CPP_ASTObject_Member_Function",
						"CPP_ASTObject_Constructor",
						"CPP_ASTObject_Destructor"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Cu.import("chrome://bound/content/modules/Extension.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");

//======================================================================================

/**
 * Export_AST
 *
 * @constructor
 */
function CPP_AST()
{
	this.root = null;
	this.astObjectsByID = {};
	this.astObjectsByUSR = {};
	
	this.TUPath = "";
}

/**
 * Creates a CPP_AST given a JSON compatible object
 * 
 * @param   {Object}   jsonObj   JSON compatible object
 * 
 * @returns {CPP_AST} New CPP_AST
 */
CPP_AST.createFromSaveObject = function createFromSaveObject(saveObj)
{
	var result = new CPP_AST();
	
	result.root = result._addASTObjectFromJSON(null, saveObj.rootJSON);
	result.root._AST = result;
	result.TUPath = saveObj.TUPath;
	
	result._toSave = saveObj._toSave;
	
	result.rootJSON = saveObj.rootJSON;
	
	return result;
}

CPP_AST.prototype = {
	constructor: CPP_AST,
	
	/**
	 * Returns the CPP_AST as a JSON compatible savable object
	 * 
	 * @returns {Object}   Object that contains savable data
	 */
	toSaveObject: function toSaveObject()
	{
		var result = {};
		result.rootJSON = this.rootJSON;
		result.TUPath = this.TUPath;
		
		return result;
	},

	/**
	* Creates an ASTType from JSON-data
	* 
	* @param   {Object}   jsonObject   The JSON-data
	* 
	* @returns {ASTType}   The newly created type
	*/
	_addASTTypeFromJSON: function _addASTTypeFromJSON(jsonObject)
	{
	   var astType = new CPP_ASTType(jsonObject.kind, this.astObjectsByID[jsonObject.declaration], jsonObject.isConst);
	   
	   if(jsonObject.pointsTo)
		   astType.pointsTo = this._addASTTypeFromJSON(jsonObject.pointsTo);
		   
	   return astType;
	}, 
	
	
	/**
	* Summary
	* 
	* @param   {ASTObject}   parent       The parent ASTObject
	* @param   {Object}      jsonObject   The JSON-data
	*
	* @returns {ASTObject}   The newly created object
	*/
	_addASTObjectFromJSON: function _addASTObjectFromJSON(parent, jsonObject)
	{
	   var astObject = null;
	   
	   var type = null;
	   var typeCanonical = null;
	   
	   switch(jsonObject.kind)
	   {
		   case "Namespace":
				// TODO: hack
				var USR = jsonObject.USR;
				if(USR == "")
					USR = "namespace_global";
				
				astObject = new CPP_ASTObject_Namespace(parent, jsonObject.name, jsonObject.id, USR);
				this.astObjectsByID[jsonObject.id] = astObject;
				this.astObjectsByUSR[USR] = astObject;
				break;
		   
		   case "Typedef":
			   type = this._addASTTypeFromJSON(jsonObject.type);
			   typeCanonical = this._addASTTypeFromJSON(jsonObject.typeCanonical);
			   astObject = new CPP_ASTObject_Typedef(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical);
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   break;
		   
		   case "Struct":
			   astObject = new CPP_ASTObject_Struct(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   
			   for(var i = 0; i < jsonObject.bases.length; ++i)
				   astObject.addBase(this.astObjectsByID[jsonObject.bases[i]], ASTObject.ACCESS_PUBLIC);
			   
			   break;
		   
		   case "Class":
			   astObject = new CPP_ASTObject_Class(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   
			   for(var i = 0; i < jsonObject.bases.length; ++i)
				   astObject.addBase(this.astObjectsByID[jsonObject.bases[i]], ASTObject.ACCESS_PUBLIC);
			   
			   break;
		   
		   case "VariableDeclaration":
			   type = this._addASTTypeFromJSON(jsonObject.type);
			   typeCanonical = this._addASTTypeFromJSON(jsonObject.typeCanonical);
			   astObject = new CPP_ASTObject_Var_Decl(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical);
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   break;
		   
		   case "Field":
			   type = this._addASTTypeFromJSON(jsonObject.type);
			   typeCanonical = this._addASTTypeFromJSON(jsonObject.typeCanonical);
			   astObject = new CPP_ASTObject_Field(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical, ASTObject.getAccessFromString(jsonObject.access), false);
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   break;
		   
		   case "Function":
			   type = this._addASTTypeFromJSON(jsonObject.returnType);
			   typeCanonical = this._addASTTypeFromJSON(jsonObject.returnTypeCanonical);
			   astObject = new CPP_ASTObject_Function(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical);
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   
			   for(var i = 0; i < jsonObject.parameters.length; ++i)
			   {
				   type = this._addASTTypeFromJSON(jsonObject.parameters[i].type);
				   typeCanonical = this._addASTTypeFromJSON(jsonObject.parameters[i].typeCanonical);
				   var param = new CPP_ASTObject_Parameter(astObject, jsonObject.parameters[i].name, type, typeCanonical);
				   astObject.addParameter(param);
			   }
			   
			   break;
		   
		   case "MemberFunction":
			   type = this._addASTTypeFromJSON(jsonObject.returnType);
			   typeCanonical = this._addASTTypeFromJSON(jsonObject.returnTypeCanonical);
			   astObject = new CPP_ASTObject_Member_Function(parent, jsonObject.name, jsonObject.id, jsonObject.USR, type, typeCanonical, ASTObject.getAccessFromString(jsonObject.access), false, false, false);
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   
			   for(var i = 0; i < jsonObject.parameters.length; ++i)
			   {
				   type = this._addASTTypeFromJSON(jsonObject.parameters[i].type);
				   typeCanonical = this._addASTTypeFromJSON(jsonObject.parameters[i].typeCanonical);
				   var param = new CPP_ASTObject_Parameter(astObject, jsonObject.parameters[i].name, type, typeCanonical);
				   astObject.addParameter(param);
			   }
			   
			   break;	
			   
		   case "Parameter":
			   break;
		   
		   case "Constructor":
			   astObject = new CPP_ASTObject_Constructor(parent, jsonObject.name, jsonObject.id, jsonObject.USR, ASTObject.getAccessFromString(jsonObject.access));
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   
			   for(var i = 0; i < jsonObject.parameters.length; ++i)
			   {
				   type = this._addASTTypeFromJSON(jsonObject.parameters[i].type);
				   typeCanonical = this._addASTTypeFromJSON(jsonObject.parameters[i].typeCanonical);
				   var param = new CPP_ASTObject_Parameter(astObject, jsonObject.name, type, typeCanonical);
				   astObject.addParameter(param);
			   }
			   
			   break;	
			   
		   case "Destructor":
			   astObject = new CPP_ASTObject_Destructor(parent, jsonObject.name, jsonObject.id, jsonObject.USR, ASTObject.getAccessFromString(jsonObject.access), false);
			   this.astObjectsByID[jsonObject.id] = astObject;
			   this.astObjectsByUSR[jsonObject.USR] = astObject;
			   break;	
	   }
	   
		if(astObject)
		{
			astObject.isDefinition = jsonObject.isDefinition;
			if(jsonObject.isDefinition)
			{
				astObject.definition = jsonObject.definition;
			}
			else
			{
				for(var i = 0, len = jsonObject.declarations; i < len; ++i)
					astObject.declarations.push(jsonObject.declarations[i]);
			}
		}
	   
	   if(jsonObject.children)
	   {
		   for(var i = 0; i < jsonObject.children.length; ++i)
			   astObject.addChild(this._addASTObjectFromJSON(astObject, jsonObject.children[i]));
	   }
	   
	   return astObject;
	}
}
	
//======================================================================================

/**
 * ASTObject
 *
 * @constructor
 * @this {ASTObject}
 */
function CPP_ASTObject(parent, name, id, usr)
{
	this.cppLongName = "";	
	ASTObject.call(this, parent, name);
	this.id = id;
	this.USR = usr;
	this.isDefinition = false;
	this.declarations = [];
	this.definition = null;
}

CPP_ASTObject.prototype = {
	constructor: CPP_ASTObject,
	source: "C++",
	language: "C++",
	
	/**
	 * Called when the parent was changed
	 */
	_onParentChanged: function _onParentChanged()
	{
		// TODO: also change for children recursively
		this.cppLongName = (this.parent == null) ? this.name : (this.parent.cppLongName + "::" + this.name);
	},
	
	/**
	 * Returns a unique identifier that can be used to reference this AST_Object f. ex. when loading
	 * 
	 * @returns {String}   Reference identifier
	 */
	getReferenceID: function getReferenceID()
	{
		return this.USR;
	}, 
	
}

//var ASTObject_parentDesc = Object.getOwnPropertyDescriptor(ASTObject.prototype, "parent");
Object.defineProperties(CPP_ASTObject.prototype, {
	"parent": { configurable: true, enumerable: true,
				get: function getParent(){ return this._parent; },
				set: function setParent(val){ this._parent = val; this._onParentChanged(); }}
});

Extension.inherit(CPP_ASTObject, ASTObject);

//======================================================================================

/**
 * CPP_ASTType
 *
 * @constructor
 * @this {CPP_ASTType}
 */
function CPP_ASTType(kind, declaration, isConst)
{
	this.kind = kind;
	
	this.declaration = (declaration == null) ? null : declaration;
	this.pointsTo = null;
	this.isConst = isConst;
};

CPP_ASTType.prototype = {
	constructor: CPP_ASTType,
	
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



//======================================================================================

/**
 * CPP_ASTObject_Namespace
 *
 * @constructor
 * @this {CPP_ASTObject_Namespace}
 */
function CPP_ASTObject_Namespace(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
};

CPP_ASTObject_Namespace.prototype = {
	constructor: CPP_ASTObject_Namespace,
	kind: ASTObject.KIND_NAMESPACE
};

// TODO: use borrowing?
Extension.inherit(CPP_ASTObject_Namespace, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_Struct
 *
 * @constructor
 * @this {CPP_ASTObject_Struct}
 */
function CPP_ASTObject_Struct(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	
	this.bases = [];
	this.functions = [];
};

CPP_ASTObject_Struct.prototype = {
	constructor: CPP_ASTObject_Struct,
	kind: ASTObject.KIND_STRUCT,
	
	/**
	 * Adds a base object
	 * 
	 * @param   {ASTObject}   baseObject   Base ASTObject (Struct or Class)
	 * @param   {Number}      access       Access specifier
	 */
	addBase: function addBase(baseObject, access)
	{
		this.bases.push({base: baseObject, access: access});
	}, 
	
};

Extension.inherit(CPP_ASTObject_Struct, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_Class
 *
 * @constructor
 * @this {CPP_ASTObject_Class}
 */
function CPP_ASTObject_Class(parent, name, id, usr)
{
	CPP_ASTObject_Struct.call(this, parent, name, id, usr);
};

CPP_ASTObject_Class.prototype = {
	constructor: CPP_ASTObject_Class,
	kind: ASTObject.KIND_CLASS,
};

Extension.inherit(CPP_ASTObject_Class, CPP_ASTObject_Struct);

//======================================================================================

/**
 * CPP_ASTObject_Typedef
 *
 * @constructor
 * @this {CPP_ASTObject_Typedef}
 */
function CPP_ASTObject_Typedef(parent, name, id, usr, type, typeCanonical)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.type = type;
	this.typeCanonical = typeCanonical;
};

CPP_ASTObject_Typedef.prototype = {
	constructor: CPP_ASTObject_Typedef,
	kind: ASTObject.KIND_TYPEDEF,
};

Extension.inherit(CPP_ASTObject_Typedef, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_Var_Decl
 *
 * @constructor
 * @this {CPP_ASTObject_Var_Decl}
 */
function CPP_ASTObject_Var_Decl(parent, name, id, usr, type, typeCanonical)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.type = type;
	this.typeCanonical = typeCanonical;
};

CPP_ASTObject_Var_Decl.prototype = {
	constructor: CPP_ASTObject_Var_Decl,
	kind: ASTObject.KIND_VARIABLE_DECL,
};

Extension.inherit(CPP_ASTObject_Var_Decl, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_Field
 *
 * @constructor
 * @this {CPP_ASTObject_Field}
 */
function CPP_ASTObject_Field(parent, name, id, usr, type, typeCanonical, access, isStatic)
{
	CPP_ASTObject_Var_Decl.call(this, parent, name, id, usr, type, typeCanonical);
	this.access = access;
	this.isStatic = isStatic;
};

CPP_ASTObject_Field.prototype = {
	constructor: CPP_ASTObject_Field,
	kind: ASTObject.KIND_FIELD,
};

Extension.inherit(CPP_ASTObject_Field, CPP_ASTObject_Var_Decl);

//======================================================================================

/**
 * CPP_ASTObject_Parameter
 *
 * @constructor
 * @this {CPP_ASTObject_Parameter}
 */
function CPP_ASTObject_Parameter(parent, name, type, typeCanonical)
{
	CPP_ASTObject_Var_Decl.call(this, parent, name, -1, "", type, typeCanonical);
};

CPP_ASTObject_Parameter.prototype = {
	constructor: CPP_ASTObject_Parameter,
	kind: ASTObject.KIND_PARAMETER,
};

Extension.inherit(CPP_ASTObject_Parameter, CPP_ASTObject_Var_Decl);

//======================================================================================

/**
 * CPP_ASTObject_Function
 *
 * @constructor
 * @this {CPP_ASTObject_Function}
 */
function CPP_ASTObject_Function(parent, name, id, usr, returnType, returnTypeCanonical)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	
	this.returnType = returnType;
	this.returnTypeCanonical = returnTypeCanonical;
	
	this.parameters = [];
	
	this.overloadName = name + "()";
};

CPP_ASTObject_Function.prototype = {
	constructor: CPP_ASTObject_Function,
	kind: ASTObject.KIND_FUNCTION,
	
	/**
	 * Adds a parameter
	 * 
	 * @param   {CPP_ASTObject_Parameter}   param   Param to add
	 */
	addParameter: function addParameter(param)
	{
		this.parameters.push(param);
		
		// TODO: performance
		this._updateOverloadName();
	},
	
	/**
	 * Updates the overload name
	 */
	_updateOverloadName: function _updateOverloadName()
	{
		this.overloadName = this.name + "(";
		for(var i = 0; i < this.parameters.length; ++i)
		{
			this.overloadName += this.parameters[i].name;	
			
			if(i !== this.parameters.length - 1)
				this.overloadName +=", ";
		}
		
		this.overloadName += ")";
	}, 
	
	
};

Extension.inherit(CPP_ASTObject_Function, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_Member_Function
 *
 * @constructor
 * @this {CPP_ASTObject_Member_Function}
 */
function CPP_ASTObject_Member_Function(parent, name, id, usr, returnType, returnTypeCanonical, access, isStatic, isVirtual, isConst)
{
	CPP_ASTObject_Function.call(this, parent, name, id, usr, returnType, returnTypeCanonical);
	this.access = access;
	this.isVirtual = isVirtual;
	this.isConst = isConst;
	this.isStatic = isStatic;
};

CPP_ASTObject_Member_Function.prototype = {
	constructor: CPP_ASTObject_Member_Function,
	kind: ASTObject.KIND_MEMBER_FUNCTION,
};

Extension.inherit(CPP_ASTObject_Member_Function, CPP_ASTObject_Function);

//======================================================================================

/**
 * CPP_ASTObject_Constructor
 *
 * @constructor
 * @this {CPP_ASTObject_Constructor}
 */
function CPP_ASTObject_Constructor(parent, name, id, usr, access)
{
	CPP_ASTObject_Member_Function.call(this, parent, name, id, usr, null, null, access, false, false)
};

CPP_ASTObject_Constructor.prototype = {
	constructor: CPP_ASTObject_Constructor,
	kind: ASTObject.KIND_CONSTRUCTOR,
};

Extension.inherit(CPP_ASTObject_Constructor, CPP_ASTObject_Member_Function);

//======================================================================================

/**
 * CPP_ASTObject_Destructor
 *
 * @constructor
 * @this {CPP_ASTObject_Destructor}
 */
function CPP_ASTObject_Destructor(parent, name, id, usr, access, isVirtual)
{
	CPP_ASTObject_Member_Function.call(this, parent, name, id, usr, null, null, access, isVirtual, false)
};

CPP_ASTObject_Destructor.prototype = {
	constructor: CPP_ASTObject_Destructor,
	kind: ASTObject.KIND_DESTRUCTOR,
};

Extension.inherit(CPP_ASTObject_Destructor, CPP_ASTObject_Member_Function);

