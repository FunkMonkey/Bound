#include "Clang_AST_CXTree.hpp"
#include "SelfDisposingCXString.hpp"
#include "clang_helpers.hpp"

#include <algorithm>

bool operator==(const CXCursor& lhs, const CXCursor& rhs)
{
	return clang_equalCursors(lhs, rhs) != 0;
}

namespace CPPAnalyzer
{
	Clang_AST_CXTreeNode::~Clang_AST_CXTreeNode()
	{
		// cleaning up astobject
		if(this->m_astObject)
		{
			delete m_astObject;
			m_astObject = nullptr;
		}

		// cleaning up children
		for (auto it = m_children.begin(), end = m_children.end(); it != end; ++it)
			delete *it;

		m_children.clear();
	}

	void Clang_AST_CXTreeNode::addCursor(CXCursor cursor)
	{

		if(std::find(m_cursors.begin(), m_cursors.end(), cursor) != m_cursors.end())
		{
			// TODO throw exception
			return;
		}

		auto location = getSourceLocationFromCursor(cursor);

		m_fileNames.insert(location.fileName);

		m_cursors.push_back(cursor);
	}

	void Clang_AST_CXTreeNode::addChild(Clang_AST_CXTreeNode* node)
	{
		if(std::find(m_children.begin(), m_children.end(), node) != m_children.end())
		{
			// TODO throw exception
			return;
		}

		node->setParentNode(this);
		m_children.push_back(node);
	}

	void Clang_AST_CXTreeNode::calculateFullName()
	{
		if(m_parentNode)
		{
			m_fullName = m_parentNode->m_fullName;

			switch(m_canonicalCursor.kind)
			{
				// C
				case CXCursor_VarDecl:
				case CXCursor_UnionDecl:
				case CXCursor_TypedefDecl:
				case CXCursor_StructDecl:
				case CXCursor_FunctionDecl:
				case CXCursor_FieldDecl:

				// C++
				case CXCursor_Namespace:
				case CXCursor_ClassDecl:
				case CXCursor_Constructor:
				case CXCursor_Destructor:
				case CXCursor_CXXMethod:
				case CXCursor_EnumDecl:
				case CXCursor_EnumConstantDecl:

				// C++: Templates
				case CXCursor_ClassTemplate:
				case CXCursor_ClassTemplatePartialSpecialization:
				case CXCursor_FunctionTemplate:
					{
						SelfDisposingCXString name(clang_getCursorSpelling(m_canonicalCursor));
						m_fullName += "::";
						m_fullName += name.c_str();
						break;
					}
				default:
					break;
			}
		}
	}

}