
#ifndef __ASTOBJECTKINDS_HPP__
#define __ASTOBJECTKINDS_HPP__

namespace CPPAnalyzer
{
	enum ASTObjectKind
	{
		KIND_INVALID,
		KIND_NAMESPACE,
		KIND_STRUCT,
		KIND_CLASS,
		KIND_VARIABLE_DECL,
		KIND_FIELD,
		KIND_FUNCTION,
		KIND_MEMBER_FUNCTION
	};

	enum ASTObjectAccess{
			ACCESS_PRIVATE,
			ACCESS_PROTECTED,
			ACCESS_PUBLIC
		};

	static std::string getASTObjectKind(ASTObjectKind kind)
	{
		switch(kind)
		{
			case KIND_NAMESPACE: return "Namespace";
			case KIND_STRUCT: return "Struct";
			case KIND_CLASS: return "Class";
			case KIND_FIELD: return "Field";
			case KIND_FUNCTION: return "Function";
		}

		return "Invalid";
	}
}

#endif // __ASTOBJECTKINDS_HPP__