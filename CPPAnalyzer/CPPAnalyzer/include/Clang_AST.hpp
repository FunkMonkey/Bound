#ifndef __CLANG_AST_H__
#define __CLANG_AST_H__

#include <clang-c/index.h>
#include <map>
#include <string>

namespace CPPAnalyzer
{
	
	class ASTObject;
	class ASTObject_Namespace;
	class ASTObject_Struct;

	class ASTObject_Field;

	struct CXCursor_less
	{
		bool operator()(CXCursor c1, CXCursor c2) const
		{ 
			return	c1.data[0] < c2.data[0] || 
				   (c1.data[0] == c2.data[0] && c1.data[1] < c2.data[1]) ||
				   (c1.data[0] == c2.data[0] && c1.data[1] == c2.data[1] && c1.data[2] < c2.data[2]);
		}
	};

	typedef std::map<CXCursor, ASTObject*, CXCursor_less> CXCursorASTObjectMap;
	

	class Clang_AST
	{
		public:
			Clang_AST(CXCursor translationUnit);
			CXChildVisitResult visitCursor(CXCursor cursor, CXCursor parent, CXClientData client_data);

			ASTObject_Namespace* addNamespace(CXCursor cursor, ASTObject* astParent);
			ASTObject_Struct* addStruct(CXCursor cursor, ASTObject* astParent);
			ASTObject_Field* addField(CXCursor cursor, ASTObject* astParent);

			void printTreeNode(ASTObject* node, int depth) const;
			void printTree() const;

		protected:

			ASTObject_Namespace* m_rootASTObject;
			CXCursor m_rootCursor;
			CXCursorASTObjectMap m_astObjects;
			std::map<std::string, ASTObject*> m_usrASTObjects;
	};
}

#endif // __CLANG_AST_H__