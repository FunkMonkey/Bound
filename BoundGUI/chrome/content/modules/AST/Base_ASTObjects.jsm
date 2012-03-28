var EXPORTED_SYMBOLS = ["ASTObject", "ASTOverloadContainer"];

Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");

//======================================================================================

/**
 * Represents an AST node
 *
 * @property {string}             name           Name of the AST node
 * @property {number}             kind           Kind of the AST node
 * @property {AST}                AST            AST the node belongs to
 * @property {ASTObject}          parent         Parent node
 * @property {ASTObject[]}        children       Children of the node
 * @property {Object<ASTObject>}  _childrenMap   Children of the node in a map by their name
 *
 * @constructor
 * @param   {ASTObject}   parent   Parent of the ASTObject
 * @param   {string}      name     Name of the ASTObject
 */
function ASTObject(parent, name)
{
	this._name = (name == null) ? "" : name;
	this._parent = null;
	this.parent = (parent == null) ? null : parent;
	
	this.children = [];
	this._childrenMap = {};
}

ASTObject.ACCESS_INVALID   = 0;
ASTObject.ACCESS_PRIVATE   = 1;
ASTObject.ACCESS_PROTECTED = 2;
ASTObject.ACCESS_PUBLIC    = 3;


/**
 * Returns the access from the given string
 *
 * @param   {string}   str   String to retrieve access from
 *
 * @returns {number}   access
 */
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
ASTObject.KIND_ENUM            = 12;
ASTObject.KIND_ENUMCONSTANT    = 13;
ASTObject.KIND_UNION           = 14;

ASTObject.KIND_TEMPLATE_TYPE_PARAMETER              = 15;
ASTObject.KIND_TEMPLATE_NON_TYPE_PARAMETER          = 16;
ASTObject.KIND_TEMPLATE_TEMPLATE_PARAMETER          = 17;
ASTObject.KIND_TEMPLATE_NULL_ARGUMENT               = 18;
ASTObject.KIND_TEMPLATE_TYPE_ARGUMENT               = 19;
ASTObject.KIND_TEMPLATE_DECLARATION_ARGUMENT        = 20;
ASTObject.KIND_TEMPLATE_INTEGRAL_ARGUMENT           = 21;
ASTObject.KIND_TEMPLATE_TEMPLATE_ARGUMENT           = 22;
ASTObject.KIND_TEMPLATE_TEMPLATE_EXPANSION_ARGUMENT = 23;
ASTObject.KIND_TEMPLATE_EXPRESSION_ARGUMENT         = 24;
ASTObject.KIND_TEMPLATE_PACK_ARGUMENT               = 25;

ASTObject.KIND_PROPERTY        = 100;
ASTObject.KIND_OBJECT          = 101;

/**
 * Returns the string of a given kind
 *
 * @param   {Number}   kind   Kind to retrieve string from
 *
 * @returns {string}   String version of kind or "Invalid"
 */
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
		case ASTObject.KIND_ENUM           : return "Enum";
		case ASTObject.KIND_ENUMCONSTANT   : return "EnumConstant";
		case ASTObject.KIND_UNION          : return "Union";
		case ASTObject.KIND_TEMPLATE_TYPE_PARAMETER:              return "TemplateTypeParameter";
		case ASTObject.KIND_TEMPLATE_NON_TYPE_PARAMETER:          return "TemplateNonTypeParameter";
		case ASTObject.KIND_TEMPLATE_TEMPLATE_PARAMETER:          return "TemplateTemplateParameter";
		case ASTObject.KIND_TEMPLATE_NULL_ARGUMENT:               return "TemplateNullArgument";
		case ASTObject.KIND_TEMPLATE_TYPE_ARGUMENT:               return "TemplateTypeArgument";
		case ASTObject.KIND_TEMPLATE_DECLARATION_ARGUMENT:        return "TemplateDeclarationArgument";
		case ASTObject.KIND_TEMPLATE_INTEGRAL_ARGUMENT:           return "TemplateIntegralArgument";
		case ASTObject.KIND_TEMPLATE_TEMPLATE_ARGUMENT:           return "TemplateTemplateArgument";
		case ASTObject.KIND_TEMPLATE_TEMPLATE_EXPANSION_ARGUMENT: return "TemplateTemplateExpansionArgument";
		case ASTObject.KIND_TEMPLATE_EXPRESSION_ARGUMENT:         return "TemplateExpressionArgument";
		case ASTObject.KIND_TEMPLATE_PACK_ARGUMENT:               return "TemplatePackArgument";
			
		case ASTObject.KIND_PROPERTY       : return "Property";
		case ASTObject.KIND_OBJECT         : return "Object";
	}
	
	return "Invalid";
}

ASTObject.prototype = {
	constructor: ASTObject,
	
	kind: ASTObject.KIND_INVALID,
	
	get AST()
	{
		if(this._AST)
			return this._AST;
		else
			return this.parent.AST;
	},
	
	get name(){ return this._name; },
	set name(value){
		if(this.parent)
			this.parent._renameChild(this, value);
		else
			this._name = value;
	},
	
	_allowOverloadedChildren: false,
	
	/**
	 * Renames the given child
	 * 
	 * @param   {ASTObject}   child            Child to rename
	 * @param   {string}      newName          New name of the child
	 */
	_renameChild: function _renameChild(child, newName)
	{
		if(child._name === newName)
			return;
		
		if(this._allowOverloadedChildren)
		{
			var beforeObj = this._childrenMap[child._name];
			if(beforeObj instanceof ASTOverloadContainer)
			{
				beforeObj.removeOverload(child);
				if(beforeObj.overloads.length === 0)
					delete this._childrenMap[child._name];
				
			}
			else
			{
				delete this._childrenMap[child._name];
			}
			
			child._name = newName;
			
			if(!this._childrenMap[child.name])
			{
				this._childrenMap[child.name] = child;
			}
			else
			{
				var obj = this._childrenMap[child.name];
				if(obj instanceof ASTOverloadContainer)
				{
					obj.addOverload(child);
				}
				else
				{
					var overloadContainer = new ASTOverloadContainer();
					
					overloadContainer.addOverload(obj);
					overloadContainer.addOverload(child);
					this._childrenMap[child.name] = overloadContainer;
				}
			}
		}
		else
		{
			if(this._childrenMap[newName])
				throw "Child with given name already exists!";
			
			delete this._childrenMap[child._name];
			child._name = newName;
			this._childrenMap[child._name] = child;
		}
	}, 
	
	
	/**
	 * Adds a child to the object, does overload resolution
	 * 
	 * @param   {ASTObject}   child    Child to add
	 */
	addChild: function addChild(child)
	{
		if(this._allowOverloadedChildren)
		{
			this.children.push(child);
			if(!this._childrenMap[child.name])
				this._childrenMap[child.name] = child;
			else
			{
				var obj = this._childrenMap[child.name];
				if(obj instanceof ASTOverloadContainer)
				{
					obj.addOverload(child);
				}
				else
				{
					var overloadContainer = new ASTOverloadContainer();
					
					overloadContainer.addOverload(obj);
					overloadContainer.addOverload(child);
					this._childrenMap[child.name] = overloadContainer;
				}
			}
		}
		else
		{
			if(this._childrenMap[child.name])
				throw "Child with given name already exists!";
			
			this.children.push(child);
			this._childrenMap[child.name] = child;
		}
		
		
	},
	
	/**
	 * Removes the child
	 * 
	 * @param   {ASTObject}   child   Child to remove
	 */
	removeChild: function removeChild(child)
	{
		if(child.parent !== this)
			return;
		
		// removing from the children-Array
		for(var i = 0, len = this.children.length; i < len; ++i)
		{
			if(this.children[i] === child)
			{
				this.children.splice(i, 1);
				break;
			}
		}
		
		// removing from the _childrenMap
		if(this._allowOverloadedChildren)
		{
			var beforeObj = this._childrenMap[child._name];
			if(beforeObj instanceof ASTOverloadContainer)
			{
				beforeObj.removeOverload(child);
				if(beforeObj.overloads.length === 0)
					delete this._childrenMap[child._name];
				
			}
			else
			{
				delete this._childrenMap[child._name];
			}
		}
		else
		{
			delete this._childrenMap[child._name];
		}
	}, 
	
	
	/**
	 * Returns the kind as a string
	 *   - uses own kind or the kind specified
	 * 
	 * @param   {number}   kind   Optional: kind to get
	 * 
	 * @returns {string}   String representation of the kind
	 */
	getKindAsString: function getKindAsString(kind)
	{
		return ASTObject.getKindAsString((kind == null) ? this.kind : kind);
	},
	
	get kindAsString(){ return ASTObject.getKindAsString(this.kind); },
	
	/**
	 * Returns a unique identifier that can be used to reference this AST_Object f. ex. when loading
	 * 
	 * @returns {string}   Reference identifier
	 */
	getReferenceID: function getReferenceID()
	{
		throw "No Reference Identifier given!";
	}, 
};

Object.defineProperties(ASTObject.prototype, {
	"parent": { configurable: true, enumerable: true,
				get: function getParent(){ return this._parent; },
				set: function setParent(val){ this._parent = val }}
});

MetaData.initMetaDataOn(ASTObject.prototype)
     .addPropertyData("name",         { view: {}})
     .addPropertyData("kindAsString", { view: { name: "kind"}})

//======================================================================================

/**
 * Represents a container for overloaded elements
 *
 * @property   {string}         name        Name of the elements
 * @property   {number}         kind        Kind of the elements
 * @property   {ASTObject[]}    overloads   Elements of the container
 *
 * @constructor
 * @this {ASTOverloadContainer}
 */
function ASTOverloadContainer()
{
	this.overloads = [];
}

ASTOverloadContainer.prototype = {
	constructor: ASTOverloadContainer,
	
	get name(){ return this.overloads[0].name; },
	get kind(){ return this.overloads[0].kind; },
	
	/**
	 * Returns the kind as a string
	 *   - uses own kind or the kind specified
	 * 
	 * @param   {number}   kind   Optional: kind to get
	 * 
	 * @returns {string}   String representation of the kind
	 */
	getKindAsString: function getKindAsString(kind)
	{
		return this.overloads[0].getKindAsString(kind);
	}, 
	
	/**
	 * Adds an overloaded member
	 * 
	 * @param   {ASTObject}   overload   Overloaded member to add
	 */
	addOverload: function addOverload(overload)
	{
		this.overloads.push(overload);
		overload.overloadContainer = this;
	},
	
	/**
	 * Removes the given overload
	 * 
	 * @param   {ASTObject}   overload   Description
	 */
	removeOverload: function removeOverload(overload)
	{
		for(var i = 0, len = this.overloads.length; i < len; ++i)
		{
			if(this.overloads[i] === overload)
			{
				this.overloads.splice(i, 1);
				overload.overloadContainer = null;
				return;
			}
		}
		
		throw "ASTObject did not exist in ASTOverloadContainer"
	}, 
};

MetaData.initMetaDataOn(ASTOverloadContainer.prototype)
     .addPropertyData("overloads", { type: "KeyValueMap",  view: {}});
	 
//======================================================================================