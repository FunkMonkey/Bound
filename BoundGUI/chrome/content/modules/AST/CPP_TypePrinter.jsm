var EXPORTED_SYMBOLS = ["CPP_TypePrinter", "CPP_TypePrinterPolicy"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");

/**
 * CPP_TypePrinterPolicy
 *
 * @constructor
 * @this {CPP_TypePrinterPolicy}
 */
function CPP_TypePrinterPolicy()
{
	this.suppressQualifiers = false;
	this.suppressNonPointerConstQualifier = false;
	this.suppressPointerConstQualifier = false;
	this.suppressScope = false;
	this.suppressGlobalNSColons = false;
};

/**
 * CPP_TypePrinter
 *
 * @constructor
 * @this {CPP_TypePrinter}
 */
function CPP_TypePrinter(policy)
{
	this.policy = policy;
};

CPP_TypePrinter.prototype = {
	constructor: CPP_TypePrinter,
	
	/**
	 * Returns the name of a builtin type
	 * // taken from http://clang.llvm.org/doxygen/MicrosoftMangle_8cpp_source.html
	 * 
	 * @param   {CPP_ASTType}   type   Type to get name for
	 * 
	 * @returns {String}   Name of builtin type
	 */
	_getBuiltInName: function _getBuiltInName(type)
	{
		switch(type.kind)
		{
			case "Void":      return "void";
			case "Bool":      return "bool";
			case "Char_U":    return "char"; // ???
			case "UChar":     return "unsigned char";
			case "Char16":    return "char16_t";
			case "Char32":    return "char32_t";
			case "UShort":    return "unsigned short";
			case "UInt":      return "unsigned int";
			case "ULong":     return "unsigned long";
			case "ULongLong": return "unsigned long long";
			case "UInt128":   return "unsigned __int128";
			case "Char_S":    return "char"; // ???
			case "SChar":     return "signed char";
			case "WChar":     return "wchar_t";
			case "Short":     return "short";
			case "Int":       return "int";
			case "Long":      return "long";
			case "LongLong":  return "long long";
			case "Int128":    return "__int128";
			case "Float":     return "float";
			case "Double":    return "double";
			case "LongDouble":return "long double";
				
			default: throw new Error("Unsupported or not a builtin type: " + type.kind);
		}
	},
	
	/**
	 * Returns the name of the given ASTObject declaration
	 * 
	 * @param   {CPP_ASTObject}   astObject              Declaration to get name for
	 * @param   {boolean}         appendScope            Show scope
	 * @param   {boolean}         appendGlobalNSColons   Show scope colons of global namespace
	 * 
	 * @returns {String}   Name of the declaration
	 */
	_getDeclarationName: function _getDeclarationName(astObject, appendScope, appendGlobalNSColons)
	{
		if(!astObject)
			throw new Error("No ASTObject given!");
		
		if(!appendScope)
			return astObject.name;
		
		switch(astObject.kind)
		{
			case ASTObject.KIND_NAMESPACE       :
				{
					if(!astObject.parent)
					{
						if(appendGlobalNSColons)
							return "::";
						else
							return "";
					}
					
					// go on, use the same as the others
				}
			case ASTObject.KIND_TYPEDEF         :
			case ASTObject.KIND_STRUCT          :
			case ASTObject.KIND_CLASS           :
			case ASTObject.KIND_VARIABLE_DECL   :
			case ASTObject.KIND_FIELD           :
			case ASTObject.KIND_FUNCTION        :
			case ASTObject.KIND_MEMBER_FUNCTION :
			case ASTObject.KIND_PARAMETER       :
			case ASTObject.KIND_CONSTRUCTOR     :
			case ASTObject.KIND_DESTRUCTOR      :
			case ASTObject.KIND_ENUM            :
			case ASTObject.KIND_ENUMCONSTANT    :
			case ASTObject.KIND_UNION           :
			case ASTObject.KIND_TEMPLATE_TYPE_PARAMETER              :
			case ASTObject.KIND_TEMPLATE_NON_TYPE_PARAMETER          :
			case ASTObject.KIND_TEMPLATE_TEMPLATE_PARAMETER          :
			case ASTObject.KIND_TEMPLATE_NULL_ARGUMENT               :
			case ASTObject.KIND_TEMPLATE_TYPE_ARGUMENT               :
			case ASTObject.KIND_TEMPLATE_DECLARATION_ARGUMENT        :
			case ASTObject.KIND_TEMPLATE_INTEGRAL_ARGUMENT           :
			case ASTObject.KIND_TEMPLATE_TEMPLATE_ARGUMENT           :
			case ASTObject.KIND_TEMPLATE_TEMPLATE_EXPANSION_ARGUMENT :
			case ASTObject.KIND_TEMPLATE_EXPRESSION_ARGUMENT         :
			case ASTObject.KIND_TEMPLATE_PACK_ARGUMENT               :
				{
					var res = this._getDeclarationName(astObject.parent, true, appendGlobalNSColons);
					if(res !== "" && res !== "::")
						res += "::";
					res += astObject.name;
					return res;
				}
			default:
				throw new Error("Unsupported ASTObject: " + astObject.kind);
		}
	},
	
	
	
	/**
	 * Returns the given ASTType as a string
	 * 
	 * @param   {CPP_ASTType}   type   ASTType to stringify
	 * 
	 * @returns {String}   String representation of ASTType
	 */
	getAsString: function getAsString(type)
	{
		var res = "";
		if(type.isBuiltIn())
		{
			if(!this.policy.suppressQualifiers && !this.policy.suppressNonPointerConstQualifier && type.isConst)
				res += "const ";
			
			return res + this._getBuiltInName(type);
		}
		else
		{
			switch(type.kind)
			{
				case "Pointer":
				case "BlockPointer":
					{
						var post = " *";
						if(!this.policy.suppressQualifiers && !this.policy.suppressPointerConstQualifier && type.isConst)
							post += "const";
							
						return this.getAsString(type.pointsTo) + post;
					}
				case "LValueReference":
				case "RValueReference":
					{
						return this.getAsString(type.pointsTo) + " &";
					}
				case "Record":
				case "Typedef":
				case "TemplateTypeParm":
				case "TemplateSpecialization":
					{
						if(!this.policy.suppressQualifiers && !this.policy.suppressNonPointerConstQualifier && type.isConst)
							res += "const ";
						
						return res + this._getDeclarationName(type.declaration, !this.policy.suppressScope, !this.policy.suppressGlobalNSColons);
					}
				default: throw new Error("Unsupported ASTType: " + type.kind);
			}
		}
	},
	
	/**
	 * Returns the given ASTType as a string
	 * 
	 * @param   {CPP_ASTType}   type   ASTType to stringify
	 * 
	 * @returns {Array}   Array of string representations of the given type, most sugared first
	 */
	getAllStrings: function getAllStrings(type, forceConst)
	{
		var isConst = type.isConst || forceConst;
		
		var pre = "";
		var post = "";
		if(type.isBuiltIn())
		{
			if(!this.policy.suppressQualifiers && isConst)
				pre += "const ";
			
			return [pre + this._getBuiltInName(type)];
		}
		else
		{
			switch(type.kind)
			{
				case "Pointer":
				case "BlockPointer":
					{
						post = " *";
						if(!this.policy.suppressQualifiers && !this.policy.suppressPointerConstQualifier && isConst)
							post += "const";
						
						var results = [];
						
						if(type.pointsTo.kind == "Typedef")
						{
							var subTypes = this.getAllStrings(type.pointsTo);
							for(var i = 0, len = subTypes.length; i < len; ++i)
								results.push(subTypes[i] + post);
						}
						else
							results.push(this.getAsString(type.pointsTo) + post);
							
						return results;
					}
				case "LValueReference":
				case "RValueReference":
					{
						pre = "";
						if(!this.policy.suppressQualifiers && !this.policy.suppressNonPointerConstQualifier && isConst)
							pre += "const ";
						
						var results = [];
						
						if(type.pointsTo.kind == "Typedef")
						{
							var subTypes = this.getAllStrings(type.pointsTo);
							for(var i = 0, len = subTypes.length; i < len; ++i)
								results.push(subTypes[i] + " &");
						}
						else
							results.push(pre + this.getAsString(type.pointsTo) + " &");
							
						return results;
					}
				case "Record":
				case "TemplateTypeParm":
				case "TemplateSpecialization":
					{
						if(!this.policy.suppressQualifiers && !this.policy.suppressNonPointerConstQualifier && isConst)
							pre += "const ";
						
						return [pre + this._getDeclarationName(type.declaration, !this.policy.suppressScope, !this.policy.suppressGlobalNSColons)];
					}
				case "Typedef":
					{
						if(!this.policy.suppressQualifiers && !this.policy.suppressNonPointerConstQualifier && isConst)
							pre += "const ";
						
						var results = [];
						results.push(pre + this._getDeclarationName(type.declaration, !this.policy.suppressScope, !this.policy.suppressGlobalNSColons));
						
						if(type.declaration.kind === ASTObject.KIND_TYPEDEF)
						{
							var subTypes = this.getAllStrings(type.declaration.type, isConst);
							for(var i = 0, len = subTypes.length; i < len; ++i)
								results.push(subTypes[i]);
						}
						
						return results;
					}
				default: throw new Error("Unsupported ASTType: " + type.kind);
			}
		}
	}, 
	
	
};