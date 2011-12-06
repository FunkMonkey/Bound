#ifndef __CLANG_AST_H__
#define __CLANG_AST_H__

#include <clang-c/index.h>
#include <map>

namespace CPPAnalyzer
{
	
	class ASTObject;
	class ASTObject_Namespace;

	struct CXCursor_less
	{
		bool operator()(CXCursor c1, CXCursor c2) const
		{ 
			return	c1.data[0] < c2.data[0] || 
				   (c1.data[0] == c2.data[0] && c1.data[1] < c2.data[1]) ||
				   (c1.data[0] == c2.data[0] && c1.data[1] == c2.data[1] && c1.data[2] < c2.data[2]));
		}
	};

	typedef std::map<CXCursor, ASTObject*, CXCursor_less> CXCursorASTObjectMap;
	

	class Clang_AST
	{
		public:
			Clang_AST(CXCursor translationUnit);

		protected:

			ASTObject_Namespace* m_rootASTObject;
			CXCursor m_rootCursor;
			CXCursorASTObjectMap m_astObjects;
	};
}

#endif // __CLANG_AST_H__