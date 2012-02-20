
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
						"CPP_ASTObject_Destructor",
						"CPP_ASTObject_Enum",
						"CPP_ASTObject_EnumConstant",
						"CPP_ASTObject_Union",
						"CPP_ASTObject_TemplateTypeParameter",
						"CPP_ASTObject_TemplateNonTypeParameter",
						"CPP_ASTObject_TemplateTemplateParameter",
						"CPP_ASTObject_TemplateTypeArgument",
						"CPP_ASTObject_TemplateDeclarationArgument",
						"CPP_ASTObject_TemplateIntegralArgument",
						"CPP_ASTObject_TemplateTemplateArgument",
						"CPP_ASTObject_TemplateExpressionArgument",
						"CPP_FakeASTObject_Property"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Cu.import("chrome://bound/content/modules/Utils/Extension.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");

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
	
	result.root = result._addASTObjectFromJSON(null, saveObj.rootJSON.AST);
	result._initASTObject(result.root);
	
	result.root._AST = result;
	result.TUPath = saveObj.TUPath;
	
	result._toSave = saveObj._toSave;
	
	result.rootJSON = saveObj.rootJSON;
	result.logMessages = saveObj.rootJSON.log;
	
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
		var astObj = null;
		if(jsonObject.declaration)
		{
			astObj = this.astObjectsByID[jsonObject.declaration];
			if(!astObj)
					throw "Could not get ASTObject for type declaration";
		}

		var astType = new CPP_ASTType(jsonObject.kind, astObj, jsonObject.isConst);
		
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
				break;
			
			case "Typedef":
				astObject = new CPP_ASTObject_Typedef(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;
			
			case "Struct":
				astObject = new CPP_ASTObject_Struct(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;
			
			case "Class":
				astObject = new CPP_ASTObject_Class(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;
			
			case "VariableDeclaration":
				astObject = new CPP_ASTObject_Var_Decl(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;
			
			case "Field":
				astObject = new CPP_ASTObject_Field(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;
			
			case "Function":
				astObject = new CPP_ASTObject_Function(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;
			
			case "Parameter":
			   astObject = new CPP_ASTObject_Parameter(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "MemberFunction":
				astObject = new CPP_ASTObject_Member_Function(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;	
			
			case "Constructor":
				astObject = new CPP_ASTObject_Constructor(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;	
			   
			case "Destructor":
				astObject = new CPP_ASTObject_Destructor(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
				break;
				
			case "Enum":
			   astObject = new CPP_ASTObject_Enum(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "EnumConstant":
			   astObject = new CPP_ASTObject_EnumConstant(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "Union":
			   astObject = new CPP_ASTObject_Union(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "TemplateTypeParameter":
			   astObject = new CPP_ASTObject_TemplateTypeParameter(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "TemplateNonTypeParameter":
			   astObject = new CPP_ASTObject_TemplateNonTypeParameter(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "TemplateTemplateParameter":
			   astObject = new CPP_ASTObject_TemplateTemplateParameter(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "TemplateTypeArgument":
			   astObject = new CPP_ASTObject_TemplateTypeArgument(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "TemplateDeclarationArgument":
			   astObject = new CPP_ASTObject_TemplateDeclarationArgument(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "TemplateIntegralArgument":
			   astObject = new CPP_ASTObject_TemplateIntegralArgument(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "TemplateTemplateArgument":
			   astObject = new CPP_ASTObject_TemplateTemplateArgument(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
			
			case "TemplateExpressionArgument":
			   astObject = new CPP_ASTObject_TemplateExpressionArgument(parent, jsonObject.name, jsonObject.id, jsonObject.USR);
			   break;
		}
	   
	   
		if(!astObject)
			throw "Unrecognized ASTObject";
		
		this.astObjectsByID[jsonObject.id] = astObject;
		this.astObjectsByUSR[(USR == null) ? jsonObject.USR : USR] = astObject;
		
		astObject.displayName = (jsonObject.displayname == null) ? jsonObject.name : jsonObject.displayname;
		
		astObject._jsonObject = jsonObject;
	   
		if(jsonObject.children)
		{
			for(var i = 0; i < jsonObject.children.length; ++i)
				astObject.addChild(this._addASTObjectFromJSON(astObject, jsonObject.children[i]));
		}
		
		return astObject;
	},
	
	/**
	 * Adds parameters to the astObject
	 * 
	 * @param   {ASTObject}   astObject   ASTObject to add params to
	 */
	_initAddParameters: function _initAddParameters(astObject)
	{
		var jsonObject = astObject._jsonObject;
		
		for(var i = 0; i < jsonObject.parameters.length; ++i)
		{
			var paramObj = this.astObjectsByID[jsonObject.parameters[i]];
			if(!paramObj)
				throw "Could not retrieve ASTObject for base class";
			astObject.addParameter(paramObj);
		}
	},
	
	/**
	 * Adds template information to the astobject
	 * 
	 * @param   {ASTObject}   astObject   ASTObject to add template information to
	 */
	_initAddTemplateInformation: function _initAddTemplateInformation(astObject)
	{
		var jsonObject = astObject._jsonObject;
		
		if(jsonObject.templateParameters)
		{
			for(var i = 0; i < jsonObject.templateParameters.length; ++i)
			{
				var paramObj = this.astObjectsByID[jsonObject.templateParameters[i]];
				if(!paramObj)
					throw "Could not retrieve ASTObject for template parameter";
				astObject.templateParameters.push(paramObj);
			}
		}
		
		if(jsonObject.templateArguments)
		{
			for(var i = 0; i < jsonObject.templateArguments.length; ++i)
			{
				var argObj = this.astObjectsByID[jsonObject.templateArguments[i]];
				if(!argObj)
					throw "Could not retrieve ASTObject for template argument";
				astObject.templateArguments.push(argObj);
			}
		}
		
		if(jsonObject.templateKind)
			astObject.templateKind = jsonObject.templateKind;
			
		if(jsonObject.templateDeclaration)
		{
			var declObj = this.astObjectsByID[jsonObject.templateDeclaration];
			if(!declObj)
				throw "Could not retrieve ASTObject for template declaration";
			astObject.templateDeclaration = declObj;
		}
	}, 
	
	
	/**
	 * Initializes the ASTObject and sets up the references
	 * 
	 * @param   {ASTObject}   astObject   ASTObject to init
	 */
	_initASTObject: function _initASTObject(astObject)
	{
		var type = null;
		var typeCanonical = null;
		
		var jsonObject = astObject._jsonObject;
	   
		switch(jsonObject.kind)
		{
			case "Namespace":
				 break;
			
			case "Typedef":
				astObject.type = this._addASTTypeFromJSON(jsonObject.type);
				astObject.typeCanonical = this._addASTTypeFromJSON(jsonObject.typeCanonical);
				break;
			
			case "Struct":
			case "Class":
				for(var i = 0; i < jsonObject.bases.length; ++i)
				{
					var baseObj = this.astObjectsByID[jsonObject.bases[i].id];
					if(!baseObj)
						throw "Could not retrieve ASTObject for base class";
					astObject.addBase(baseObj, ASTObject.getAccessFromString(jsonObject.bases[i].access));
				}
				
				this._initAddTemplateInformation(astObject);
				
				break;
			
			case "VariableDeclaration":
				astObject.type = this._addASTTypeFromJSON(jsonObject.type);
				astObject.typeCanonical = this._addASTTypeFromJSON(jsonObject.typeCanonical);
				break;
			
			case "Field":
				astObject.type = this._addASTTypeFromJSON(jsonObject.type);
				astObject.typeCanonical = this._addASTTypeFromJSON(jsonObject.typeCanonical);
				astObject.access = ASTObject.getAccessFromString(jsonObject.access);
				astObject.isStatic = jsonObject.isStatic;
				break;
			
			case "Function":
				astObject.returnType = this._addASTTypeFromJSON(jsonObject.returnType);
				astObject.returnTypeCanonical = this._addASTTypeFromJSON(jsonObject.returnTypeCanonical);
				
				this._initAddParameters(astObject);
				this._initAddTemplateInformation(astObject);
				
				break;
			
			case "MemberFunction":
				astObject.returnType = this._addASTTypeFromJSON(jsonObject.returnType);
				astObject.returnTypeCanonical = this._addASTTypeFromJSON(jsonObject.returnTypeCanonical);
				astObject.access = ASTObject.getAccessFromString(jsonObject.access);
				astObject.isStatic = jsonObject.isStatic;
				astObject.isVirtual = jsonObject.isVirtual;
				astObject.isConst = jsonObject.isConst;
				
				this._initAddParameters(astObject);
				this._initAddTemplateInformation(astObject);
				
				break;	
				
			case "Parameter":
				astObject.type = this._addASTTypeFromJSON(jsonObject.type);
				astObject.typeCanonical = this._addASTTypeFromJSON(jsonObject.typeCanonical);
				break;
			
			case "Constructor":
				astObject.access = ASTObject.getAccessFromString(jsonObject.access);
				
				this._initAddParameters(astObject);
				this._initAddTemplateInformation(astObject);
				
				break;	
				
			case "Destructor":
				astObject.access = ASTObject.getAccessFromString(jsonObject.access);
				astObject.isVirtual = jsonObject.isVirtual;
				
				this._initAddTemplateInformation(astObject);
				
				break;
				 
			case "Enum":
				break;
			
			case "EnumConstant":
				astObject.value = jsonObject.value;
				break;
			
			case "Union":
				break;
			
			case "TemplateTypeParameter":
				break;
			
			case "TemplateNonTypeParameter":
				break;
			
			case "TemplateTemplateParameter":
				break;
			
			case "TemplateTypeArgument":
				astObject.type = this._addASTTypeFromJSON(jsonObject.type);
				astObject.typeCanonical = this._addASTTypeFromJSON(jsonObject.typeCanonical);
				astObject.name = "TemplateArgument";
				astObject.displayName = astObject.type.kind;
				break;
			
			case "TemplateDeclarationArgument":
				var declObj = this.astObjectsByID[jsonObject.declaration];
				if(!declObj)
					throw "Could not retrieve ASTObject for template declaration argument";
				astObject.declaration = declObj;
				astObject.displayName = declObj.name;
				astObject.name = "TemplateArgument";
				break;
			
			case "TemplateIntegralArgument":
				astObject.integral = jsonObject.integral;
				astObject.displayName = astObject.integral;
				astObject.name = "TemplateArgument";
				break;
			
			case "TemplateTemplateArgument":
				var declObj = this.astObjectsByID[jsonObject.template];
				if(!declObj)
					throw "Could not retrieve ASTObject for template template argument";
				astObject.template = declObj;
				astObject.displayName = declObj.name;
				astObject.name = "TemplateArgument";
				break;
			
			case "TemplateExpressionArgument":
				astObject.name = "TemplateArgument";
				break;
		}
		
		astObject.isDefinition = (jsonObject.isDefinition == null) ? false : true;
		if(jsonObject.isDefinition)
			astObject.definition = jsonObject.definition;
		
		if(jsonObject.declarations)
			for(var i = 0, len = jsonObject.declarations.length; i < len; ++i)
				astObject.declarations.push(jsonObject.declarations[i]);
		
		// removing it, as it was only temporary
		delete astObject._jsonObject;
		
		for(var i = 0; i < astObject.children.length; ++i)
			this._initASTObject(astObject.children[i]);
	}, 
	
}

MetaData.initMetaDataOn(CPP_AST.prototype)
   .addPropertyData("TUPath", {view: {}})
	
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
	this.id = (id == null) ? -1 : id;
	this.USR = (usr == null) ? "" : usr;
	this.isDefinition = false;
	this.declarations = [];
	this.definition = null;
	this.displayName = "";
}

CPP_ASTObject.prototype = {
	constructor: CPP_ASTObject,
	source: "C++",
	language: "C++",
	
	_allowOverloadedChildren: true,
	
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

MetaData.initMetaDataOn(CPP_ASTObject.prototype)
   .addPropertyData("USR",          {view: {}})
   .addPropertyData("isDefinition", {view: {}})
   //.addPropertyData("definition",   {view: {}})
   //.addPropertyData("declarations", {view: {}})

Extension.inherit(CPP_ASTObject, ASTObject);

//======================================================================================

/**
 * 
 *
 * @constructor
 * @this {CPP_FakeASTObject_Property}
 */
function CPP_FakeASTObject_Property()
{
	this.getter = null;
	this.setter = null;
}

CPP_FakeASTObject_Property.prototype = {
	constructor: CPP_FakeASTObject_Property,
	kind: ASTObject.KIND_PROPERTY
	
};

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

MetaData.initMetaDataOn(CPP_ASTType.prototype)
   .addPropertyData("kind",          {view: {}})
   .addPropertyData("declaration",   {view: {}})
   .addPropertyData("pointsTo",      {view: {}})
   .addPropertyData("isConst",       {view: {}})



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
 * 
 *
 * @constructor
 * @this {CPP_Base}
 */
function CPP_Base(baseObject, access)
{
	this.base = baseObject;
	this.access = access;
}

MetaData.initMetaDataOn(CPP_Base.prototype)
   .addPropertyData("base",          {view: {}})
   .addPropertyData("access",        {view: {}})

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
	
	// template information
	this.templateParameters = [];
	this.templateArguments = [];
	this.templateDeclaration = null;
	this.templateKind = "";
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
		this.bases.push(new CPP_Base(baseObject, access));
	}, 
	
};

Extension.inherit(CPP_ASTObject_Struct, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_Struct.prototype)
   .addPropertyData("bases",               {view: {}})
   .addPropertyData("templateKind",        {view: {}})
   .addPropertyData("templateParameters",  {view: {}})
   .addPropertyData("templateArguments",   {view: {}})
   .addPropertyData("templateDeclaration", {view: {}})

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
function CPP_ASTObject_Typedef(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.type = null;
	this.typeCanonical = null;
};

CPP_ASTObject_Typedef.prototype = {
	constructor: CPP_ASTObject_Typedef,
	kind: ASTObject.KIND_TYPEDEF,
};

Extension.inherit(CPP_ASTObject_Typedef, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_Typedef.prototype)
   .addPropertyData("type",          {view: {}})
   .addPropertyData("typeCanonical", {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_Var_Decl
 *
 * @constructor
 * @this {CPP_ASTObject_Var_Decl}
 */
function CPP_ASTObject_Var_Decl(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.type = null;
	this.typeCanonical = null;
};

CPP_ASTObject_Var_Decl.prototype = {
	constructor: CPP_ASTObject_Var_Decl,
	kind: ASTObject.KIND_VARIABLE_DECL,
};

Extension.inherit(CPP_ASTObject_Var_Decl, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_Var_Decl.prototype)
   .addPropertyData("type",          {view: {}})
   .addPropertyData("typeCanonical", {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_Field
 *
 * @constructor
 * @this {CPP_ASTObject_Field}
 */
function CPP_ASTObject_Field(parent, name, id, usr)
{
	CPP_ASTObject_Var_Decl.call(this, parent, name, id, usr);
	this.access = ASTObject.ACCESS_INVALID;
	this.isStatic = false;
};

CPP_ASTObject_Field.prototype = {
	constructor: CPP_ASTObject_Field,
	kind: ASTObject.KIND_FIELD,
};

Extension.inherit(CPP_ASTObject_Field, CPP_ASTObject_Var_Decl);

MetaData.initMetaDataOn(CPP_ASTObject_Field.prototype)
   .addPropertyData("access",          {view: {}})
   .addPropertyData("isStatic",        {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_Parameter
 *
 * @constructor
 * @this {CPP_ASTObject_Parameter}
 */
function CPP_ASTObject_Parameter(parent, name, id, usr)
{
	CPP_ASTObject_Var_Decl.call(this, parent, name, id, usr);
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
function CPP_ASTObject_Function(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	
	this.returnType = null;
	this.returnTypeCanonical = null;
	
	this.parameters = [];
	this.templateParameters = [];
	this.templateArguments = [];
	this.templateDeclaration = null;
	this.templateKind = "";
	
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

MetaData.initMetaDataOn(CPP_ASTObject_Function.prototype)
   .addPropertyData("returnType",          {view: {}})
   .addPropertyData("returnTypeCanonical", {view: {}})
   .addPropertyData("templateKind",        {view: {}})
   .addPropertyData("templateParameters",  {view: {}})
   .addPropertyData("templateArguments",   {view: {}})
   .addPropertyData("templateDeclaration", {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_Member_Function
 *
 * @constructor
 * @this {CPP_ASTObject_Member_Function}
 */
function CPP_ASTObject_Member_Function(parent, name, id, usr)
{
	CPP_ASTObject_Function.call(this, parent, name, id, usr);
	this.access = ASTObject.ACCESS_INVALID;
	this.isVirtual = false;
	this.isConst = false;
	this.isStatic = false;
};

CPP_ASTObject_Member_Function.prototype = {
	constructor: CPP_ASTObject_Member_Function,
	kind: ASTObject.KIND_MEMBER_FUNCTION,
};

Extension.inherit(CPP_ASTObject_Member_Function, CPP_ASTObject_Function);

MetaData.initMetaDataOn(CPP_ASTObject_Member_Function.prototype)
   .addPropertyData("access",          {view: {}})
   .addPropertyData("isStatic",        {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_Constructor
 *
 * @constructor
 * @this {CPP_ASTObject_Constructor}
 */
function CPP_ASTObject_Constructor(parent, name, id, usr)
{
	CPP_ASTObject_Member_Function.call(this, parent, name, id, usr)
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
function CPP_ASTObject_Destructor(parent, name, id, usr)
{
	CPP_ASTObject_Member_Function.call(this, parent, name, id, usr)
};

CPP_ASTObject_Destructor.prototype = {
	constructor: CPP_ASTObject_Destructor,
	kind: ASTObject.KIND_DESTRUCTOR,
};

Extension.inherit(CPP_ASTObject_Destructor, CPP_ASTObject_Member_Function);

//======================================================================================

/**
 * CPP_ASTObject_Enum
 *
 * @constructor
 * @this {CPP_ASTObject_Enum}
 */
function CPP_ASTObject_Enum(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
};

CPP_ASTObject_Enum.prototype = {
	constructor: CPP_ASTObject_Enum,
	kind: ASTObject.KIND_ENUM
};

Extension.inherit(CPP_ASTObject_Enum, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_EnumConstant
 *
 * @constructor
 * @this {CPP_ASTObject_EnumConstant}
 */
function CPP_ASTObject_EnumConstant(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	
	this.value = -1;
};

CPP_ASTObject_EnumConstant.prototype = {
	constructor: CPP_ASTObject_EnumConstant,
	kind: ASTObject.KIND_ENUMCONSTANT
};

Extension.inherit(CPP_ASTObject_EnumConstant, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_EnumConstant.prototype)
   .addPropertyData("value",          {view: {}})
   
//======================================================================================

/**
 * CPP_ASTObject_Union
 *
 * @constructor
 * @this {CPP_ASTObject_Union}
 */
function CPP_ASTObject_Union(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
};

CPP_ASTObject_Union.prototype = {
	constructor: CPP_ASTObject_Union,
	kind: ASTObject.KIND_UNION,
};

Extension.inherit(CPP_ASTObject_Union, CPP_ASTObject);
   
//======================================================================================

/**
 * CPP_ASTObject_TemplateTypeParameter
 *
 * @constructor
 * @this {CPP_ASTObject_TemplateTypeParameter}
 */
function CPP_ASTObject_TemplateTypeParameter(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
};

CPP_ASTObject_TemplateTypeParameter.prototype = {
	constructor: CPP_ASTObject_TemplateTypeParameter,
	kind: ASTObject.KIND_TEMPLATE_TYPE_PARAMETER,
};

Extension.inherit(CPP_ASTObject_TemplateTypeParameter, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_TemplateNonTypeParameter
 *
 * @constructor
 * @this {CPP_ASTObject_TemplateNonTypeParameter}
 */
function CPP_ASTObject_TemplateNonTypeParameter(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
};

CPP_ASTObject_TemplateNonTypeParameter.prototype = {
	constructor: CPP_ASTObject_TemplateNonTypeParameter,
	kind: ASTObject.KIND_TEMPLATE_NON_TYPE_PARAMETER,
};

Extension.inherit(CPP_ASTObject_TemplateNonTypeParameter, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_TemplateTemplateParameter
 *
 * @constructor
 * @this {CPP_ASTObject_TemplateTemplateParameter}
 */
function CPP_ASTObject_TemplateTemplateParameter(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
};

CPP_ASTObject_TemplateTemplateParameter.prototype = {
	constructor: CPP_ASTObject_TemplateTemplateParameter,
	kind: ASTObject.KIND_TEMPLATE_TEMPLATE_PARAMETER,
};

Extension.inherit(CPP_ASTObject_TemplateTemplateParameter, CPP_ASTObject);

//======================================================================================

/**
 * CPP_ASTObject_TemplateTypeArgument
 *
 * @constructor
 * @this {CPP_ASTObject_TemplateTypeArgument}
 */
function CPP_ASTObject_TemplateTypeArgument(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.type = null;
	this.typeCanonical = null;
};

CPP_ASTObject_TemplateTypeArgument.prototype = {
	constructor: CPP_ASTObject_TemplateTypeArgument,
	kind: ASTObject.KIND_TEMPLATE_TYPE_ARGUMENT,
};

Extension.inherit(CPP_ASTObject_TemplateTypeArgument, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_TemplateTypeArgument.prototype)
   .addPropertyData("type",          {view: {}})
   .addPropertyData("typeCanonical", {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_TemplateDeclarationArgument
 *
 * @constructor
 * @this {CPP_ASTObject_TemplateDeclarationArgument}
 */
function CPP_ASTObject_TemplateDeclarationArgument(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.declaration = null;
};

CPP_ASTObject_TemplateDeclarationArgument.prototype = {
	constructor: CPP_ASTObject_TemplateDeclarationArgument,
	kind: ASTObject.KIND_TEMPLATE_DECLARATION_ARGUMENT,
};

Extension.inherit(CPP_ASTObject_TemplateDeclarationArgument, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_TemplateDeclarationArgument.prototype)
   .addPropertyData("declaration",          {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_TemplateIntegralArgument
 *
 * @constructor
 * @this {CPP_ASTObject_TemplateIntegralArgument}
 */
function CPP_ASTObject_TemplateIntegralArgument(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.integral = 0;
};

CPP_ASTObject_TemplateIntegralArgument.prototype = {
	constructor: CPP_ASTObject_TemplateIntegralArgument,
	kind: ASTObject.KIND_TEMPLATE_INTEGRAL_ARGUMENT,
};

Extension.inherit(CPP_ASTObject_TemplateIntegralArgument, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_TemplateIntegralArgument.prototype)
   .addPropertyData("integral",          {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_TemplateTemplateArgument
 *
 * @constructor
 * @this {CPP_ASTObject_TemplateTemplateArgument}
 */
function CPP_ASTObject_TemplateTemplateArgument(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.template = null;
};

CPP_ASTObject_TemplateTemplateArgument.prototype = {
	constructor: CPP_ASTObject_TemplateTemplateArgument,
	kind: ASTObject.KIND_TEMPLATE_TEMPLATE_ARGUMENT,
};

Extension.inherit(CPP_ASTObject_TemplateTemplateArgument, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_TemplateTemplateArgument.prototype)
   .addPropertyData("template",          {view: {}})

//======================================================================================

/**
 * CPP_ASTObject_TemplateExpressionArgument
 *
 * @constructor
 * @this {CPP_ASTObject_TemplateExpressionArgument}
 */
function CPP_ASTObject_TemplateExpressionArgument(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
};

CPP_ASTObject_TemplateExpressionArgument.prototype = {
	constructor: CPP_ASTObject_TemplateExpressionArgument,
	kind: ASTObject.KIND_TEMPLATE_EXPRESSION_ARGUMENT,
};

Extension.inherit(CPP_ASTObject_TemplateExpressionArgument, CPP_ASTObject);

