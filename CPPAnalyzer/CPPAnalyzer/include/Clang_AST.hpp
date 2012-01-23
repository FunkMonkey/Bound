#ifndef __CLANG_AST_H__
#define __CLANG_AST_H__

#include <clang-c/index.h>
#include <map>
#include <string>

namespace CPPAnalyzer
{
	class ASTType;
	class ASTObject;
	class ASTObject_Namespace;
	class ASTObject_Typedef;
	class ASTObject_Struct;
	class ASTObject_Class;
	class ASTObject_Function;
	class ASTObject_Member_Function;
	class ASTObject_Parameter;
	class ASTObject_Variable_Decl;
	class ASTObject_Constructor;
	class ASTObject_Destructor;

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
			ASTObject_Class* addClass(CXCursor cursor, ASTObject* astParent);
			ASTObject_Field* addField(CXCursor cursor, ASTObject* astParent);
			ASTObject_Function* addFunction(CXCursor cursor, ASTObject* astParent);
			ASTObject_Member_Function* addMemberFunction(CXCursor cursor, ASTObject* astParent);
			ASTObject_Parameter* addParameter(CXCursor cursor, ASTObject* astParent);
			ASTObject_Constructor* addConstructor(CXCursor cursor, ASTObject* astParent);
			ASTObject_Destructor* addDestructor(CXCursor cursor, ASTObject* astParent);
			ASTObject_Typedef* addTypedef(CXCursor cursor, ASTObject* astParent);
			void addBase(CXCursor cursor, ASTObject* astParent);

			ASTType* createASTTypeFromCursor(CXCursor cursor, bool canonical = false);
			ASTType* createASTType(CXType type, bool canonical = false);
			ASTObject* getTypeDeclaration(CXCursor cursor, bool canonical);

			void printTreeNode(ASTObject* node, int depth) const;
			void printTree() const;

			ASTObject_Namespace* getRootASTObject(){ return m_rootASTObject; }

		protected:

			ASTObject_Namespace* m_rootASTObject;
			CXCursor m_rootCursor;
			CXCursorASTObjectMap m_astObjects;	// TODO: merge
			CXCursorASTObjectMap m_canonicalASTObjects;
			std::map<std::string, ASTObject*> m_usrASTObjects;
	};
}

#endif // __CLANG_AST_H__