
#ifndef __ASTOBJECTKINDS_HPP__
#define __ASTOBJECTKINDS_HPP__

namespace CPPAnalyzer
{
	/** Represents all kinds of exported AST nodes
	 */
	enum ASTObjectKind
	{
		KIND_INVALID,
		KIND_NAMESPACE,
		KIND_TYPEDEF,
		KIND_STRUCT,
		KIND_CLASS,
		KIND_VARIABLE_DECL,
		KIND_FIELD,
		KIND_FUNCTION,
		KIND_MEMBER_FUNCTION,
		KIND_PARAMETER,
		KIND_CONSTRUCTOR,
		KIND_DESTRUCTOR,
		KIND_ENUM,
		KIND_ENUMCONSTANT,
		KIND_UNION,
		KIND_TEMPLATE_TYPE_PARAMETER,
		KIND_TEMPLATE_NON_TYPE_PARAMETER,
		KIND_TEMPLATE_TEMPLATE_PARAMETER,
		KIND_TEMPLATE_NULL_ARGUMENT,
		KIND_TEMPLATE_TYPE_ARGUMENT,
		KIND_TEMPLATE_DECLARATION_ARGUMENT,
		KIND_TEMPLATE_INTEGRAL_ARGUMENT,
		KIND_TEMPLATE_TEMPLATE_ARGUMENT,
		KIND_TEMPLATE_TEMPLATE_EXPANSION_ARGUMENT,
		KIND_TEMPLATE_EXPRESSION_ARGUMENT,
		KIND_TEMPLATE_PACK_ARGUMENT
	};

	/** Represents all kinds of access (private, protected, public)
	 */
	enum ASTObjectAccess{
			ACCESS_INVALID,
			ACCESS_PRIVATE,
			ACCESS_PROTECTED,
			ACCESS_PUBLIC
		};

	// TODO: rename
	/** Returns a string representation of the given access kind
	 *
	 * \param   access  Access kind
	 *
	 * \return 	String representation of access kind
	 */
	static const char* getASTObjectAccessString(ASTObjectAccess access)
	{
		switch(access)
		{
			case ACCESS_PRIVATE: return "private";
			case ACCESS_PROTECTED: return "protected";
			case ACCESS_PUBLIC: return "public";
		}
		return "invalid";
	}

	/** Represents all kinds of templates
	 */
	enum ASTObjectTemplateKind
	{
		TEMPLATE_KIND_NON_TEMPLATE,
		TEMPLATE_KIND_TEMPLATE,
		TEMPLATE_KIND_PARTIAL_SPECIALIZATION,
		TEMPLATE_KIND_SPECIALIZATION
	};

	/** Returns a string representation of the given template kind
	 *
	 * \param   access  Template kind
	 *
	 * \return 	String representation of template kind
	 */
	static const char* getTemplateKindSpelling(ASTObjectTemplateKind kind)
	{
		switch(kind)
		{
			case TEMPLATE_KIND_NON_TEMPLATE: return "NonTemplate";
			case TEMPLATE_KIND_TEMPLATE: return "Template";
			case TEMPLATE_KIND_PARTIAL_SPECIALIZATION: return "PartialSpecialization";
			case TEMPLATE_KIND_SPECIALIZATION: return "Specialization";
		}
		return "Invalid";
	}

	// TODO: rename
	/** Returns a string representation of the given ASTObject kind
	 *
	 * \param   access  ASTObject kind
	 *
	 * \return 	String representation of ASTObject kind
	 */
	static const char* getASTObjectKind(ASTObjectKind kind)
	{
		switch(kind)
		{
			case KIND_NAMESPACE: return "Namespace";
			case KIND_TYPEDEF: return "Typedef";
			case KIND_STRUCT: return "Struct";
			case KIND_CLASS: return "Class";
			case KIND_VARIABLE_DECL: return "VariableDeclaration";
			case KIND_FIELD: return "Field";
			case KIND_FUNCTION: return "Function";
			case KIND_MEMBER_FUNCTION: return "MemberFunction";
			case KIND_PARAMETER: return "Parameter";
			case KIND_CONSTRUCTOR: return "Constructor";
			case KIND_DESTRUCTOR: return "Destructor";
			case KIND_ENUM: return "Enum";	
			case KIND_ENUMCONSTANT: return "EnumConstant";	
			case KIND_UNION: return "Union";
			case KIND_TEMPLATE_TYPE_PARAMETER: return "TemplateTypeParameter";
			case KIND_TEMPLATE_NON_TYPE_PARAMETER: return "TemplateNonTypeParameter";
			case KIND_TEMPLATE_TEMPLATE_PARAMETER: return "TemplateTemplateParameter";
			case KIND_TEMPLATE_NULL_ARGUMENT: return "TemplateNullArgument";
			case KIND_TEMPLATE_TYPE_ARGUMENT: return "TemplateTypeArgument";
			case KIND_TEMPLATE_DECLARATION_ARGUMENT: return "TemplateDeclarationArgument";
			case KIND_TEMPLATE_INTEGRAL_ARGUMENT: return "TemplateIntegralArgument";
			case KIND_TEMPLATE_TEMPLATE_ARGUMENT: return "TemplateTemplateArgument";
			case KIND_TEMPLATE_TEMPLATE_EXPANSION_ARGUMENT: return "TemplateTemplateExpansionArgument";
			case KIND_TEMPLATE_EXPRESSION_ARGUMENT: return "TemplateExpressionArgument";
			case KIND_TEMPLATE_PACK_ARGUMENT: return "TemplatePackArgument";
		}

		return "Invalid";
	}
}

#endif // __ASTOBJECTKINDS_HPP__