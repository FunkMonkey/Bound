#ifndef __CLANG_AST_H__
#define __CLANG_AST_H__

#include <clang-c/index.h>
#include <map>
#include <string>

#include "ASTObjectKinds.hpp"

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
	class ASTObject_Enum;
	class ASTObject_EnumConstant;
	class ASTObject_Field;

	class ASTObject_TemplateTypeParameter;
	class ASTObject_TemplateNonTypeParameter;
	class ASTObject_TemplateTemplateParameter;

	class ASTObject_TemplateNullArgument;
	class ASTObject_TemplateTypeArgument;
	class ASTObject_TemplateDeclarationArgument;
	class ASTObject_TemplateIntegralArgument;
	class ASTObject_TemplateTemplateArgument;
	class ASTObject_TemplateTemplateExpansionArgument;
	class ASTObject_TemplateExpressionArgument;
	class ASTObject_TemplatePackArgument;

	class ASTObjectHelper_Template;

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

	class SelfDisposingCXString
	{
		public:
			SelfDisposingCXString(CXString str)
				: m_cxString(str)
			{}

			~SelfDisposingCXString()
			{
				clang_disposeString(m_cxString);
			}

			const char* c_str() const { return clang_getCString(m_cxString); }
			CXString getCXString() const { return m_cxString; }

		protected:
			CXString m_cxString;
	};
	

	class Clang_AST
	{
		public:
			Clang_AST(CXCursor translationUnit);
			CXChildVisitResult visitCursor(CXCursor cursor, CXCursor parent, CXClientData client_data);

			ASTObject* getASTObjectFromCursor(CXCursor cursor);
			void registerASTObject(CXCursor cursor, ASTObject* astObject);
			void setTemplateInformation(ASTObjectHelper_Template& templateInfo, CXCursor cursor, ASTObject* astParent);

			ASTObject_Namespace* addNamespace(CXCursor cursor, ASTObject* astParent);
			ASTObject_Variable_Decl* addVariableDecl(CXCursor cursor, ASTObject* astParent);
			ASTObject_Struct* addStruct(CXCursor cursor, ASTObject* astParent);
			ASTObject_Class* addClass(CXCursor cursor, ASTObject* astParent);
			ASTObject_Field* addField(CXCursor cursor, ASTObject* astParent);
			ASTObject_Function* addFunction(CXCursor cursor, ASTObject* astParent);
			ASTObject_Member_Function* addMemberFunction(CXCursor cursor, ASTObject* astParent);
			ASTObject_Parameter* addParameter(CXCursor cursor, ASTObject* astParent);
			ASTObject_Constructor* addConstructor(CXCursor cursor, ASTObject* astParent);
			ASTObject_Destructor* addDestructor(CXCursor cursor, ASTObject* astParent);
			ASTObject_Typedef* addTypedef(CXCursor cursor, ASTObject* astParent);
			ASTObject_Enum* addEnum(CXCursor cursor, ASTObject* astParent);
			ASTObject_EnumConstant* addEnumConstant(CXCursor cursor, ASTObject* astParent);

			ASTObject_TemplateTypeParameter* addTemplateTypeParameter(CXCursor cursor, ASTObject* astParent);
			ASTObject_TemplateNonTypeParameter* addTemplateNonTypeParameter(CXCursor cursor, ASTObject* astParent);
			ASTObject_TemplateTemplateParameter* addTemplateTemplateParameter(CXCursor cursor, ASTObject* astParent);

			ASTObject_TemplateTypeArgument* addTemplateTypeArgument(CXCursor cursor, ASTObject* astParent);
			ASTObject_TemplateDeclarationArgument* addTemplateDeclarationArgument(CXCursor cursor, ASTObject* astParent);
			ASTObject_TemplateIntegralArgument* addTemplateIntegralArgument(CXCursor cursor, ASTObject* astParent);
			ASTObject_TemplateTemplateArgument* addTemplateTemplateArgument(CXCursor cursor, ASTObject* astParent);
			ASTObject_TemplateExpressionArgument* addTemplateExpressionArgument(CXCursor cursor, ASTObject* astParent);

			void addBase(CXCursor cursor, ASTObject* astParent);

			ASTType* createASTTypeFromCursor(CXCursor cursor, bool canonical, ASTObject_Namespace* templateScope);
			ASTType* createASTType(CXType type, bool canonical, ASTObject_Namespace* templateScope);
			ASTObject* getTypeDeclaration(CXCursor cursor, bool canonical);

			void printTreeNode(ASTObject* node, int depth) const;
			void printTree() const;

			ASTObject_Namespace* getRootASTObject(){ return m_rootASTObject; }

		protected:

			ASTObject_Namespace* m_rootASTObject;
			CXCursor m_rootCursor;
			CXCursorASTObjectMap m_astObjects;	// TODO: merge
			CXCursorASTObjectMap m_canonicalASTObjects;
	};
}

#endif // __CLANG_AST_H__