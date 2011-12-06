#ifndef __AST_CREATOR_HPP__
#define __AST_CREATOR_HPP__

#include <clang-c/index.h>

namespace CPPAnalyzer
{
	class ASTObject;
	class ASTObject_Namespace;
	class ASTObject_Struct;

	class ASTCreator
	{
	public:
		static ASTObject_Namespace* createNamespace(CXCursor cursor, ASTObject* parent);
		static ASTObject_Struct* createStruct(CXCursor cursor, ASTObject* parent);
	};
}

#endif // __AST_CREATOR_HPP__