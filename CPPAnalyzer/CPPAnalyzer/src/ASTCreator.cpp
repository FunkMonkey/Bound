#include "ASTCreator.hpp"
#include "ASTObject.hpp"
#include "ASTObject_Namespace.hpp"
#include "ASTObject_Struct.hpp"

namespace CPPAnalyzer
{
	ASTObject_Namespace* ASTCreator::createNamespace(CXCursor cursor, ASTObject* parent)
	{
		CXString displayName = clang_getCursorDisplayName(cursor);
		return new ASTObject_Namespace(clang_getCString(displayName));
	}

	ASTObject_Struct* ASTCreator::createStruct(CXCursor cursor, ASTObject* parent)
	{
		CXString displayName = clang_getCursorDisplayName(cursor);
		return new ASTObject_Struct(clang_getCString(displayName));
	}
}