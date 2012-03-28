
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
Cu.import("chrome://bound/content/modules/Utils/Logger.jsm");
Cu.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Cu.import("chrome://bound/content/modules/AST/CPP_ASTType.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");

//======================================================================================

/**
 * Represents a C++ AST
 *
 * @property {CPP_ASTObject}           root               Root node
 * @property {Object<CPP_ASTObject>}   astObjectsByID     Maps IDs and AST nodes
 * @property {Object<CPP_ASTObject>}   astObjectsByUSR    Maps USRs and AST nodes
 * @property {Object<CPP_ASTType>}     astTypesByID       Maps IDs and AST types
 * @property {string}   translationUnitFilename           Filename of the translation unit
 * @property {string}   translationUnitDirectory          Directory of the translation unit
 * @property {Logger}   logger   Logger instance for C++ logs
 *
 * @constructor
 */
function CPP_AST()
{
	this.root = null;
	this.astObjectsByID = {};
	this.astObjectsByUSR = {};
	
	this.astTypesByID = {};
	
	this.translationUnitFilename = "";
	this.translationUnitDirectory = "";
	
	this.logger = new Logger();
}

// TODO: rename to loadFromSaveObject and put into the prototype
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
	
	result.translationUnitFilename = saveObj.AST_JSON.AST.translationUnitFilename;
	result.translationUnitDirectory = result.translationUnitFilename;
	
	var lastIndex = result.translationUnitFilename.lastIndexOf("/");
	if(lastIndex != -1)
		result.translationUnitDirectory = result.translationUnitFilename.substring(0, lastIndex + 1);
	else
	{
		var lastIndex = result.translationUnitFilename.lastIndexOf("\\");
		if(lastIndex != -1)
			result.translationUnitDirectory = result.translationUnitFilename.substring(0, lastIndex + 1);
	}
	
	var types = saveObj.AST_JSON.AST.types;
	for(var i = 0; i < types.length; ++i)
		result.astTypesByID[types[i].id] = result._addASTTypeFromJSON(types[i]);
	
	result.root = result._addASTObjectFromJSON(null, saveObj.AST_JSON.AST.root);
	
	result._initASTObject(result.root);
	for(var typeID in result.astTypesByID)
		result._initASTType(result.astTypesByID[typeID]);
	
	result.root._AST = result;
	
	
	result._toSave = saveObj._toSave;
	
	result.AST_JSON = saveObj.AST_JSON;
	
	// adding the log messages
	_addLogMessages(result.logger, saveObj.AST_JSON.log.Clang);
	_addLogMessages(result.logger, saveObj.AST_JSON.log.Export);
	
	//result.logMessages = saveObj.AST_JSON.log;
	
	return result;
}

/**
 * Adds the log messages during loading
 * 
 * @param   {Logger}   logger         Logger to add messages to
 * @param   {Array}    messageArray   Messages to add
 */
function _addLogMessages(logger, messageArray)
{
	var currDate = new Date(); // they can all share the same timestamp
	for(var i = 0, len = messageArray.length; i < len; ++i)
	{
		switch(messageArray[i].type)
		{
			case "Info":
				logger.addInfoMessage(messageArray[i].message, currDate);
				break;
			case "Warning":
				logger.addWarningMessage(messageArray[i].message, currDate);
				break;
			case "Error":
				logger.addErrorMessage(messageArray[i].message, currDate);
				break;
		}
	}
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
		result.AST_JSON = this.AST_JSON;
		//result.translationUnitFilename = this.translationUnitFilename;
		
		return result;
	},
	
	/**
	* Creates an ASTType from JSON-data
	* 
	* @param   {Object}   jsonObject   The JSON-data
	* 
	* @returns {CPP_ASTType}   The newly created type
	*/
	_addASTTypeFromJSON: function _addASTTypeFromJSON(jsonObject)
	{
		var astType = null;
		if(jsonObject.kind == "FunctionProto")
			astType = new CPP_ASTFunctionType(jsonObject.kind, jsonObject.id);
		else
			astType = new CPP_ASTType(jsonObject.kind, jsonObject.id);
		
		astType._jsonObject = jsonObject;
			
		return astType;
	},
	
	/**
	 * Returns the ASTType for the given id or throws exception of not existing
	 * 
	 * @param   {Number}   id   Id to look for
	 * 
	 * @returns {CPP_ASTType}   Found ASTType
	 */
	_getASTTypeOrExcept: function _getASTTypeOrExcept(id)
	{
		var type = this.astTypesByID[id];
		if(!type)
			throw new Error("Could not get ASTType for given id");
		
		return type;
	}, 
	
	
	/**
	* Initializes the ASTType and sets up the references
	* 
	* @param   {CPP_ASTType}   astType   The type to initialize
	*/
	_initASTType: function _initASTType(astType)
	{
		var jsonObject = astType._jsonObject;
		
		if(jsonObject.kind == "FunctionProto")
		{
			if(jsonObject.parameters)
			{
				for(var i = 0; i < jsonObject.parameters.length; ++i)
					astType.parameters.push(this._getASTTypeOrExcept(jsonObject.parameters[i]));
			}
		}
		else
		{
			var astObj = null;
			if(jsonObject.declaration)
			{
				astObj = this.astObjectsByID[jsonObject.declaration];
				if(!astObj)
					throw "Could not get ASTObject for type declaration";
				
				astType.declaration = astObj;
			}
			
			if(jsonObject.pointsTo)
				astType.pointsTo = this._getASTTypeOrExcept(jsonObject.pointsTo);
		}
		
		astType.isConst = jsonObject.isConst;
		
		if(jsonObject.canonicalType)
			astType.canonicalType = this._getASTTypeOrExcept(jsonObject.canonicalType);
			
		// removing it, as it was only temporary
		delete astType._jsonObject;	
			
		return astType;
	}, 
		
	
	/**
	* Creates and adds an AST node from the given save object
	* 
	* @param   {CPP_ASTObject}   parent       The parent ASTObject
	* @param   {Object}          jsonObject   The JSON-data
	*
	* @returns {CPP_ASTObject}   The newly created object
	*/
	_addASTObjectFromJSON: function _addASTObjectFromJSON(parent, jsonObject)
	{
		var astObject = null;
		
		var type = null;
	   
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
	 * @param   {CPP_ASTObject}   astObject   ASTObject to add params to
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
	 * @param   {CPP_ASTObject}   astObject   ASTObject to add template information to
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
	 * @param   {CPP_ASTObject}   astObject   ASTObject to init
	 */
	_initASTObject: function _initASTObject(astObject)
	{
		var type = null;
		
		var jsonObject = astObject._jsonObject;
	   
		switch(jsonObject.kind)
		{
			case "Namespace":
				 break;
			
			case "Typedef":
				astObject.type = this._getASTTypeOrExcept(jsonObject.type);
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
				astObject.type = this._getASTTypeOrExcept(jsonObject.type);
				break;
			
			case "Field":
				astObject.type = this._getASTTypeOrExcept(jsonObject.type);
				astObject.access = ASTObject.getAccessFromString(jsonObject.access);
				astObject.isStatic = jsonObject.isStatic;
				break;
			
			case "Function":
				astObject.returnType = this._getASTTypeOrExcept(jsonObject.returnType);
				
				this._initAddParameters(astObject);
				this._initAddTemplateInformation(astObject);
				
				break;
			
			case "MemberFunction":
				astObject.returnType = this._getASTTypeOrExcept(jsonObject.returnType);
				astObject.access = ASTObject.getAccessFromString(jsonObject.access);
				astObject.isStatic = jsonObject.isStatic;
				astObject.isVirtual = jsonObject.isVirtual;
				astObject.isConst = jsonObject.isConst;
				
				this._initAddParameters(astObject);
				this._initAddTemplateInformation(astObject);
				
				break;	
				
			case "Parameter":
				astObject.type = this._getASTTypeOrExcept(jsonObject.type);
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
				astObject.type = this._getASTTypeOrExcept(jsonObject.type);
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
			
		if(jsonObject.isDefinition)
		{
			astObject.isDefinition = true;
			astObject.definition = { fileName: jsonObject.definition.fileName };
		}
		else
		{
			astObject.isDefinition = false;
		}
		
		if(jsonObject.declarations)
			for(var i = 0, len = jsonObject.declarations.length; i < len; ++i)
				astObject.declarations.push({ fileName: jsonObject.declarations[i].fileName});
		
		// removing it, as it was only temporary
		delete astObject._jsonObject;
		
		for(var i = 0; i < astObject.children.length; ++i)
			this._initASTObject(astObject.children[i]);
	},
	
}

MetaData.initMetaDataOn(CPP_AST.prototype)
   .addPropertyData("translationUnitFilename", {view: {}})
   .addPropertyData("translationUnitDirectory", {view: {}})
	
//======================================================================================

/**
 * Represents a C++ AST node
 *
 * @constructor
 * @extends ASTObject
 * 
 * @property {number}          id             ID of the ASTObject (from CPPAnalyzer)
 * @property {string}          USR            USR of the node
 * @property {boolean}         isDefinition   Checks if node is a definition
 * @property {LocationInfo[]}  declarations   Location information about all declarations
 * @property {LocationInfo}    definiiton     Location information about definition
 * @property {string}          cppLongName    Full name of node (e.g. ::std::string)
 * @property {string}          displayName    Display name
 * 
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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

Extension.inherit(CPP_ASTObject, ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject.prototype)
   .addPropertyData("USR",          {view: {}})
   .addPropertyData("isDefinition", {view: {}})
   .addPropertyData("definition",   {view: {}})
   .addPropertyData("declarations", {view: {}})



//======================================================================================

/**
 * Represents a fake C++ node that is a property
 *
 * @constructor
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
 * Represents a C++ namespace
 *
 * @constructor
 * @extends CPP_ASTObject
 * 
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ base class specification
 *
 * @constructor
 *
 * @property   {CPP_ASTObject_Struct}   base     Base AST node
 * @property   {number}                 access   Access of inheritance
 *
 * @param   {CPP_ASTObject_Struct}   base     Base AST node
 * @param   {number}                 access   Access of inheritance
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
 * Represents a C++ struct
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @property   {CPP_Base[]}        bases                  Information about base classes
 * @property   {CPP_ASTObject[]}   templateParameters     List of template parameters
 * @property   {CPP_ASTObject[]}   templateArguments      List of template arguments
 * @property   {CPP_ASTObject}     templateDeclaration    Declaration of the template
 * @property   {string}            templateKind           Kind of template ("Template", "Specialization", etc.)
 * 
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
	 * Adds a base AST node
	 * 
	 * @param   {CPP_ASTObject_Struct}   baseObject   Base ASTObject (Struct or Class)
	 * @param   {number}                 access       Access specifier
	 */
	addBase: function addBase(baseObject, access)
	{
		this.bases.push(new CPP_Base(baseObject, access));
	},
	
	/**
	 * Checks if this struct/class is a subclass of the given parent
	 * 
	 * @param   {CPP_ASTObject_Struct}   parent   Parent to check
	 * 
	 * @returns {boolean}   True if subclass, otherwise false
	 */
	isSubclassOf: function isSubclassOf(parent)
	{
		for(var i = 0, len = this.bases.length; i < len; ++i)
		{
			if(this.bases[i].base === parent)
				return true;
		}
		
		for(var i = 0, len = this.bases.length; i < len; ++i)
		{
			if(this.bases[i].base.isSubClassOf(parent))
				return true;
		}
		
		return false;
	},
	
	/**
	 * Checks if the given member belongs to the struct or one of its baseclasses
	 * 
	 * @param   {CPP_ASTObject}   member   Member node to check
	 * 
	 * @returns {boolean}   True if it belongs, otherwise false
	 */
	hasMember: function hasMember(member)
	{
		if(member.parent === this)
			return true;
		
		for(var i = 0, len = this.bases.length; i < len; ++i)
		{
			if(this.bases[i].base === member.parent)
				return true;
		}
		
		return false;
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
 * Represents a C++ class
 *
 * @constructor
 * @extends CPP_ASTObject_Struct
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ typedef
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @property   {CPP_ASTType}  type     Type that this typedef sugars
 * 
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
 */
function CPP_ASTObject_Typedef(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.type = null;
};

CPP_ASTObject_Typedef.prototype = {
	constructor: CPP_ASTObject_Typedef,
	kind: ASTObject.KIND_TYPEDEF,
};

Extension.inherit(CPP_ASTObject_Typedef, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_Typedef.prototype)
   .addPropertyData("type",          {view: {}})

//======================================================================================

/**
 * Represents a C++ variable declaration
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @property   {CPP_ASTType}  type     Type of the variable
 * 
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
 */
function CPP_ASTObject_Var_Decl(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.type = null;
};

CPP_ASTObject_Var_Decl.prototype = {
	constructor: CPP_ASTObject_Var_Decl,
	kind: ASTObject.KIND_VARIABLE_DECL,
};

Extension.inherit(CPP_ASTObject_Var_Decl, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_Var_Decl.prototype)
   .addPropertyData("type",          {view: {}})

//======================================================================================

/**
 * Represents a C++ field (data member of a struct or class)
 *
 * @constructor
 * @extends CPP_ASTObject_Var_Decl
 *
 * @property   {number}   access       Type of access
 * @property   {boolean}  isStatic     Is field static or not
 * 
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ function parameter
 *
 * @constructor
 * @extends CPP_ASTObject_Var_Decl
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ function
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @property   {CPP_ASTType}                returnType             Return type of the function
 * @property   {CPP_ASTObject_Parameter[]}  parameters             List of parameters
 * @property   {CPP_ASTObject[]}            templateParameters     List of template parameters
 * @property   {CPP_ASTObject[]}            templateArguments      List of template arguments
 * @property   {CPP_ASTObject}              templateDeclaration    Declaration of the template
 * @property   {string}                     templateKind           Kind of template ("Template", "Specialization", etc.)
 * @property   {string}                     overloadName           Full name of the overload (includes types)
 * 
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
 */
function CPP_ASTObject_Function(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	
	this.returnType = null;
	
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
   .addPropertyData("templateKind",        {view: {}})
   .addPropertyData("templateParameters",  {view: {}})
   .addPropertyData("templateArguments",   {view: {}})
   .addPropertyData("templateDeclaration", {view: {}})

//======================================================================================

/**
 * Represents a C++ member function
 *
 * @constructor
 * @extends CPP_ASTObject_Function
 *
 * @property   {number}   access      Type of access
 * @property   {boolean}  isVirtual   Is function declared 'virtual'
 * @property   {boolean}  isConst     Is function declared 'const'
 * @property   {boolean}  isStatic    Is function declared 'static'
 * 
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ constructor
 *
 * @constructor
 * @extends CPP_ASTObject_Member_Function
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ destructor
 *
 * @constructor
 * @extends CPP_ASTObject_Member_Function
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ enum
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ enum constant
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ union
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ template type parameter
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ template non-type parameter
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ template template parameter
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ template type argument
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @property   {CPP_ASTType}   type   Type of the argument
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
 */
function CPP_ASTObject_TemplateTypeArgument(parent, name, id, usr)
{
	CPP_ASTObject.call(this, parent, name, id, usr);
	this.type = null;
};

CPP_ASTObject_TemplateTypeArgument.prototype = {
	constructor: CPP_ASTObject_TemplateTypeArgument,
	kind: ASTObject.KIND_TEMPLATE_TYPE_ARGUMENT,
};

Extension.inherit(CPP_ASTObject_TemplateTypeArgument, CPP_ASTObject);

MetaData.initMetaDataOn(CPP_ASTObject_TemplateTypeArgument.prototype)
   .addPropertyData("type",          {view: {}})

//======================================================================================

/**
 * Represents a C++ template declaration argument
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @property   {CPP_ASTObject}   declaration   Declaration of the argument
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ template integral argument
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @property   {number}   integral   Integral of the argument
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ template template argument
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @property   {CPP_ASTObject}   template   Template of the argument
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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
 * Represents a C++ template expression argument
 *
 * @constructor
 * @extends CPP_ASTObject
 *
 * @param   {CPP_ASTObject}   parent   Parent of the ASTObject
 * @param   {string}          name     Name of the ASTObject
 * @param   {number}          id       ID of the ASTObject (from CPPAnalyzer)
 * @param   {string}          usr      USR of the node
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

