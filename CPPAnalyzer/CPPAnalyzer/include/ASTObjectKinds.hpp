
#ifndef __ASTOBJECTKINDS_HPP__
#define __ASTOBJECTKINDS_HPP__

namespace CPPAnalyzer
{
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
		KIND_DESTRUCTOR
	};

	enum ASTObjectAccess{
			ACCESS_INVALID,
			ACCESS_PRIVATE,
			ACCESS_PROTECTED,
			ACCESS_PUBLIC
		};

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
		}

		return "Invalid";
	}
}

#endif // __ASTOBJECTKINDS_HPP__