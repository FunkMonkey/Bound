
#include "Clang_AST.hpp"


#include "ASTCreator.hpp"
#include "ASTObject_Namespace.hpp"
#include "ASTObject_Struct.hpp"

#include <iostream>

#include <string>


namespace CPPAnalyzer
{
	Clang_AST::Clang_AST(CXCursor translationUnit)
	: m_rootCursor(translationUnit)
	{
		m_rootASTObject = new ASTObject_Namespace("");
		m_astObjects.insert(std::pair<CXCursor, ASTObject*>(m_rootCursor, m_rootASTObject));
	}
}


