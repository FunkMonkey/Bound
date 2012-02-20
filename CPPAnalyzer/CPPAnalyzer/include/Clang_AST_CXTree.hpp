#ifndef __CLANG_AST_CXTREE_HPP__
#define __CLANG_AST_CXTREE_HPP__

#include <clang-c/index.h>
#include <vector>
#include <string>
#include <set>

namespace CPPAnalyzer
{
	class ASTObject;

	enum CXTreeNode_Visibility
	{
		VISIBILITY_NONE,
		VISIBILITY_VISIBLE,
		VISIBILITY_REFERENCED
	};

	class Clang_AST_CXTreeNode
	{
		public:
			explicit Clang_AST_CXTreeNode(Clang_AST_CXTreeNode* parent = nullptr)
				: m_parentNode(parent), m_astObject(nullptr), m_visibility(VISIBILITY_NONE), m_fullName("")
			{
				m_canonicalCursor = clang_getNullCursor();
			}

			// TODO: destructor with TreeNode and ASTobject cleanup


			Clang_AST_CXTreeNode* getParentNode() const { return m_parentNode; }
			void setParentNode(Clang_AST_CXTreeNode* val) { m_parentNode = val; calculateFullName(); }

			CXCursor getCanonicalCursor() const { return m_canonicalCursor; }
			void setCanonicalCursor(CXCursor val) { m_canonicalCursor = val; }

			ASTObject* getASTObject() const { return m_astObject; }
			void setASTObject(ASTObject* val) { m_astObject = val; }

			const std::vector<CXCursor>& getCursors() const { return m_cursors; }
			std::vector<CXCursor>& getCursors() { return m_cursors; }

			CXTreeNode_Visibility getVisibility() const { return m_visibility; }
			void setVisibility(CXTreeNode_Visibility val) { m_visibility = val; }

			const std::string& getFullName() const { return m_fullName; }
			const std::set<std::string>& getFileNames() const { return m_fileNames; }


			void addCursor(CXCursor cursor);
			void addChild(Clang_AST_CXTreeNode* node);
			const std::vector<Clang_AST_CXTreeNode*>& getChildren() const { return m_children; }

		protected:

			void calculateFullName();

			Clang_AST_CXTreeNode* m_parentNode;
			std::vector<Clang_AST_CXTreeNode*> m_children;
			CXCursor              m_canonicalCursor;
			ASTObject*            m_astObject;
			std::vector<CXCursor> m_cursors;

			CXTreeNode_Visibility m_visibility;
			std::string           m_fullName;

			std::set<std::string> m_fileNames;
			
	};
}

#endif // __CLANG_AST_CXTREE_HPP__
