var EXPORTED_SYMBOLS = ["ASTObject"];


//======================================================================================

/**
 * ASTObject
 *
 * @constructor
 * @this {ASTObject}
 */
function ASTObject(parent, name)
{
	this.parent = parent;
	this.name = name;
	
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
				{
					obj.push(child);
					child.overloadContainer = obj;
				}
				else
				{
					let arr = [];
					arr.name = child.name;
					arr.kind = child.kind; // so it is just the last kind
					
					obj.overloadContainer = arr;
					child.overloadContainer = arr;
					
					arr.push(obj);
					arr.push(child);
					this._childrenMap[child.name] = arr;
				}
				
				
			}
		}
	},
};