
var EXPORTED_SYMBOLS = ["CPP_ASTObject",
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

Cu.import("chrome://bound/content/modules/Extension.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");

//======================================================================================

/**
 * ASTObject
 *
 * @constructor
 * @this {ASTObject}
 */
function CPP_ASTObject(parent, name, id, usr)
{
	ASTObject.call(this, parent, name);
	this.id = id;
	this.USR = usr;
}

CPP_ASTObject.prototype = {
	constructor: CPP_ASTObject,
	source: "C++",
	language: "C++"
}

Extension.borrow(CPP_ASTObject.prototype, ASTObject.prototype);

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
	constructor: CPP_ASTType
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
function CPP_ASTObject_Field(parent, name, id, usr, type, typeCanonical, access)
{
	CPP_ASTObject_Var_Decl.call(this, parent, name, id, usr, type, typeCanonical);
	this.access = access;
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
		for(let i = 0; i < this.parameters.length; ++i)
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
function CPP_ASTObject_Member_Function(parent, name, id, usr, returnType, returnTypeCanonical, access, isVirtual, isConst)
{
	CPP_ASTObject_Function.call(this, parent, name, id, usr, returnType, returnTypeCanonical);
	this.access = access;
	this.isVirtual = isVirtual;
	this.isConst = isConst;
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

