
var EXPORTED_SYMBOLS = ["ASTObject",
						"ASTType",
						"ASTObject_Namespace",
						"ASTObject_Struct",
						"ASTObject_Class",
						"ASTObject_Typedef",
						"ASTObject_Var_Decl",
						"ASTObject_Field",
						"ASTObject_Parameter",
						"ASTObject_Function",
						"ASTObject_Member_Function",
						"ASTObject_Constructor",
						"ASTObject_Destructor"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/Extension.jsm")


//======================================================================================

/**
 * ASTObject
 *
 * @constructor
 * @this {ASTObject}
 */
function ASTObject(parent, name, id, usr)
{
	this.parent = parent;
	this.name = name;
	this.id = id;
	this.USR = usr;
	
	this.children = [];
	this._childrenMap = {};
}

ASTObject.ACCESS_INVALID   = 0;
ASTObject.ACCESS_PRIVATE   = 1;
ASTObject.ACCESS_PROTECTED = 2;
ASTObject.ACCESS_PUBLIC    = 3;

ASTObject.getAccessFromString = function getAccessFromString(str)
{
	switch(str)
	{
		case "private":   return ASTObject.ACCESS_PRIVATE;
		case "protected": return ASTObject.ACCESS_PROTECTED;
		case "public":    return ASTObject.ACCESS_PUBLIC;
	}
	
	return ASTObject.ACCESS_INVALID;
}

ASTObject.KIND_INVALID         = 0;
ASTObject.KIND_NAMESPACE       = 1;
ASTObject.KIND_TYPEDEF         = 2;
ASTObject.KIND_STRUCT          = 3;
ASTObject.KIND_CLASS           = 4;
ASTObject.KIND_VARIABLE_DECL   = 5;
ASTObject.KIND_FIELD           = 6;
ASTObject.KIND_FUNCTION        = 7;
ASTObject.KIND_MEMBER_FUNCTION = 8;
ASTObject.KIND_PARAMETER       = 9;
ASTObject.KIND_CONSTRUCTOR     = 10;
ASTObject.KIND_DESTRUCTOR      = 11;

ASTObject.getKindAsString = function getKindAsString(kind)
{
	switch(kind)
	{
		case ASTObject.KIND_INVALID        : return "Invalid";
		case ASTObject.KIND_NAMESPACE      : return "Namespace";
		case ASTObject.KIND_TYPEDEF        : return "Typedef";
		case ASTObject.KIND_STRUCT         : return "Struct";
		case ASTObject.KIND_CLASS          : return "Class";
		case ASTObject.KIND_VARIABLE_DECL  : return "VariableDeclaration";
		case ASTObject.KIND_FIELD          : return "Field";
		case ASTObject.KIND_FUNCTION       : return "Function";
		case ASTObject.KIND_MEMBER_FUNCTION: return "MemberFunction";
		case ASTObject.KIND_PARAMETER      : return "Parameter";
		case ASTObject.KIND_CONSTRUCTOR    : return "Constructor";
		case ASTObject.KIND_DESTRUCTOR     : return "Destructor";
	}
	
	return "Invalid";
}

ASTObject.prototype = {
	constructor: ASTObject,
	
	kind: ASTObject.KIND_INVALID,
	
	/**
	 * Adds a child to the object, does overload resolution
	 * 
	 * @param   {ASTObject}   child   Child to add
	 */
	addChild: function addChild(child)
	{
		this.children.push(child);
		if(child.name !== "")
		{
			if(!this._childrenMap[child.name])
				this._childrenMap[child.name] = child;
			else
			{
				let obj = this._childrenMap[child.name];
				if(obj instanceof Array)
					obj.push(child);
				else
				{
					let arr = [];
					arr.push(obj);
					arr.push(child);
					this._childrenMap[child.name] = arr;
				}
			}
		}
	}, 
};

//======================================================================================

/**
 * ASTType
 *
 * @constructor
 * @this {ASTType}
 */
function ASTType(kind, declaration, isConst)
{
	this.kind = kind;
	
	this.declaration = (declaration == null) ? null : declaration;
	this.pointsTo = null;
	this.isConst = isConst;
};

ASTType.prototype = {
	constructor: ASTType
};



//======================================================================================

/**
 * ASTObject_Namespace
 *
 * @constructor
 * @this {ASTObject_Namespace}
 */
function ASTObject_Namespace(parent, name, id, usr)
{
	ASTObject.call(this, parent, name, id, usr);
};

ASTObject_Namespace.prototype = {
	constructor: ASTObject_Namespace,
	kind: ASTObject.KIND_NAMESPACE
};

Extension.inherit(ASTObject_Namespace, ASTObject);

//======================================================================================

/**
 * ASTObject_Struct
 *
 * @constructor
 * @this {ASTObject_Struct}
 */
function ASTObject_Struct(parent, name, id, usr)
{
	ASTObject.call(this, parent, name, id, usr);
	
	this.bases = [];
	this.functions = [];
};

ASTObject_Struct.prototype = {
	constructor: ASTObject_Struct,
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

Extension.inherit(ASTObject_Struct, ASTObject);

//======================================================================================

/**
 * ASTObject_Class
 *
 * @constructor
 * @this {ASTObject_Class}
 */
function ASTObject_Class(parent, name, id, usr)
{
	ASTObject_Struct.call(this, parent, name, id, usr);
};

ASTObject_Class.prototype = {
	constructor: ASTObject_Class,
	kind: ASTObject.KIND_CLASS,
};

Extension.inherit(ASTObject_Class, ASTObject_Struct);

//======================================================================================

/**
 * ASTObject_Typedef
 *
 * @constructor
 * @this {ASTObject_Typedef}
 */
function ASTObject_Typedef(parent, name, id, usr, type, typeCanonical)
{
	ASTObject.call(this, parent, name, id, usr);
	this.type = type;
	this.typeCanonical = typeCanonical;
};

ASTObject_Typedef.prototype = {
	constructor: ASTObject_Typedef,
	kind: ASTObject.KIND_TYPEDEF,
};

Extension.inherit(ASTObject_Typedef, ASTObject);

//======================================================================================

/**
 * ASTObject_Var_Decl
 *
 * @constructor
 * @this {ASTObject_Var_Decl}
 */
function ASTObject_Var_Decl(parent, name, id, usr, type, typeCanonical)
{
	ASTObject.call(this, parent, name, id, usr);
	this.type = type;
	this.typeCanonical = typeCanonical;
};

ASTObject_Var_Decl.prototype = {
	constructor: ASTObject_Var_Decl,
	kind: ASTObject.KIND_VARIABLE_DECL,
};

Extension.inherit(ASTObject_Var_Decl, ASTObject);

//======================================================================================

/**
 * ASTObject_Field
 *
 * @constructor
 * @this {ASTObject_Field}
 */
function ASTObject_Field(parent, name, id, usr, type, typeCanonical, access)
{
	ASTObject_Var_Decl.call(this, parent, name, id, usr, type, typeCanonical);
	this.access = access;
};

ASTObject_Field.prototype = {
	constructor: ASTObject_Field,
	kind: ASTObject.KIND_FIELD,
};

Extension.inherit(ASTObject_Field, ASTObject_Var_Decl);

//======================================================================================

/**
 * ASTObject_Parameter
 *
 * @constructor
 * @this {ASTObject_Parameter}
 */
function ASTObject_Parameter(parent, name, type, typeCanonical)
{
	ASTObject_Var_Decl.call(this, parent, name, -1, "", type, typeCanonical);
};

ASTObject_Parameter.prototype = {
	constructor: ASTObject_Parameter,
	kind: ASTObject.KIND_PARAMETER,
};

Extension.inherit(ASTObject_Parameter, ASTObject_Var_Decl);

//======================================================================================

/**
 * ASTObject_Function
 *
 * @constructor
 * @this {ASTObject_Function}
 */
function ASTObject_Function(parent, name, id, usr, returnType, returnTypeCanonical)
{
	ASTObject.call(this, parent, name, id, usr);
	this.returnType = returnType;
	this.returnTypeCanonical = returnTypeCanonical;
	
	this.parameters = [];
};

ASTObject_Function.prototype = {
	constructor: ASTObject_Function,
	kind: ASTObject.KIND_FUNCTION,
	
	/**
	 * Adds a parameter
	 * 
	 * @param   {ASTObject_Parameter}   param   Param to add
	 */
	addParameter: function addParameter(param)
	{
		this.parameters.push(param);
	}, 
	
};

Extension.inherit(ASTObject_Function, ASTObject);

//======================================================================================

/**
 * ASTObject_Member_Function
 *
 * @constructor
 * @this {ASTObject_Member_Function}
 */
function ASTObject_Member_Function(parent, name, id, usr, returnType, returnTypeCanonical, access, isVirtual, isConst)
{
	ASTObject_Function.call(this, parent, name, id, usr, returnType, returnTypeCanonical);
	this.access = access;
	this.isVirtual = isVirtual;
	this.isConst = isConst;
};

ASTObject_Member_Function.prototype = {
	constructor: ASTObject_Member_Function,
	kind: ASTObject.KIND_MEMBER_FUNCTION,
};

Extension.inherit(ASTObject_Member_Function, ASTObject_Function);

//======================================================================================

/**
 * ASTObject_Constructor
 *
 * @constructor
 * @this {ASTObject_Constructor}
 */
function ASTObject_Constructor(parent, name, id, usr, access)
{
	ASTObject_Member_Function.call(this, parent, name, id, usr, null, null, access, false, false)
};

ASTObject_Constructor.prototype = {
	constructor: ASTObject_Constructor,
	kind: ASTObject.KIND_CONSTRUCTOR,
};

Extension.inherit(ASTObject_Constructor, ASTObject_Member_Function);

//======================================================================================

/**
 * ASTObject_Destructor
 *
 * @constructor
 * @this {ASTObject_Destructor}
 */
function ASTObject_Destructor(parent, name, id, usr, access, isVirtual)
{
	ASTObject_Member_Function.call(this, parent, name, id, usr, null, null, access, isVirtual, false)
};

ASTObject_Destructor.prototype = {
	constructor: ASTObject_Destructor,
	kind: ASTObject.KIND_DESTRUCTOR,
};

Extension.inherit(ASTObject_Destructor, ASTObject_Member_Function);

