#ifndef __CLANG_AST_HPP__
#define __CLANG_AST_HPP__

#include <clang-c/index.h>
#include <map>
#include <string>
#include <regex>

#include "ASTObjectKinds.hpp"
#include "Logger.hpp"

namespace CPPAnalyzer
{
	class Clang_AST_CXTreeNode;

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
	class ASTObject_Union;

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

	enum Filter_Access
	{
		NONE = 1,
		PRIVATE,
		PROTECTED,
		PUBLIC,
		PRIVATE_PROTECTED,
		PRIVATE_PUBLIC,
		PROTECTED_PUBLIC,
		PRIVATE_PROTECTED_PUBLIC,
		ALL = PRIVATE_PROTECTED_PUBLIC
	};

	enum Rule_Success
	{
		RULE_SUCCESS,
		RULE_FAIL,
		RULE_FAIL_CHECK_CHILDREN
	};

	class VisibilityFilter
	{
		public:
			VisibilityFilter(const std::string& fileRegex, const std::string& nameRegex, Filter_Access accessFilter)
				: fileFilter(fileRegex), nameFilter(nameRegex), accessFilter(accessFilter)
			{}

			Filter_Access accessFilter;
			std::regex fileFilter;
			std::regex nameFilter;
	};

	class Clang_AST
	{
		public:
			Clang_AST();
			void setTranslationUnit(CXTranslationUnit TU);

			CXChildVisitResult visitCursor(CXCursor cursor, CXCursor parent, CXClientData client_data);

			// C
			ASTObject_Variable_Decl*   createVariableDecl(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Struct*          createStruct(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Field*           createField(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Function*        createFunction(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Parameter*       createParameter(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Typedef*         createTypedef(Clang_AST_CXTreeNode& treeNode);

			// C++
			ASTObject_Namespace*       createNamespace(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Enum*            createEnum(Clang_AST_CXTreeNode& treeNode);
			ASTObject_EnumConstant*    createEnumConstant(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Union*           createUnion(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Class*           createClass(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Constructor*     createConstructor(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Destructor*      createDestructor(Clang_AST_CXTreeNode& treeNode);
			ASTObject_Member_Function* createMemberFunction(Clang_AST_CXTreeNode& treeNode);
			
			// C++: Templates
			ASTObject_TemplateTypeParameter*     createTemplateTypeParameter(Clang_AST_CXTreeNode& treeNode);
			ASTObject_TemplateNonTypeParameter*  createTemplateNonTypeParameter(Clang_AST_CXTreeNode& treeNode);
			ASTObject_TemplateTemplateParameter* createTemplateTemplateParameter(Clang_AST_CXTreeNode& treeNode);

			ASTObject_TemplateTypeArgument*        createTemplateTypeArgument(Clang_AST_CXTreeNode& treeNode);
			ASTObject_TemplateDeclarationArgument* createTemplateDeclarationArgument(Clang_AST_CXTreeNode& treeNode);
			ASTObject_TemplateIntegralArgument*    createTemplateIntegralArgument(Clang_AST_CXTreeNode& treeNode);
			ASTObject_TemplateTemplateArgument*    createTemplateTemplateArgument(Clang_AST_CXTreeNode& treeNode);
			ASTObject_TemplateExpressionArgument*  createTemplateExpressionArgument(Clang_AST_CXTreeNode& treeNode);


			// Types
			ASTType* createASTTypeFromCursor(CXCursor cursor, bool canonical);
			ASTType* createASTType(CXType type, bool canonical, CXCursor src);
			ASTObject* getTypeDeclaration(CXCursor cursor, bool canonical);

			// Helper functions
			void setBaseInformation(Clang_AST_CXTreeNode& treeNode);
			void setTemplateInformation(ASTObjectHelper_Template& templateInfo, CXCursor cursor, ASTObject* astParent);

			void printTreeNode(ASTObject* node, int depth) const;
			void printTree() const;

			const VisibilityFilter& getFilter() const { return m_filter; }
			void setFilter(const VisibilityFilter& val) { m_filter = val; }

			

			CXCursor getParentCursor(CXCursor cursor);

			// ==================================================================================================================================

			void analyze();

			Clang_AST_CXTreeNode* getTreeNodeFromCursor(CXCursor cursor);
			Clang_AST_CXTreeNode* getRootTreeNode(){ return m_rootTreeNode; }
			Clang_AST_CXTreeNode* getReferencedTreeNodeFromCursor(CXCursor cursor);
			void markTreeNodeAsReferenced(Clang_AST_CXTreeNode& treeNode);

			const Logger& getLogger() const { return m_logger; }
			Logger& getLogger(){ return m_logger; }

		protected:

			Rule_Success checkFileRule(Clang_AST_CXTreeNode& treeNode);
			Rule_Success checkNameRule(Clang_AST_CXTreeNode& treeNode);
			Rule_Success checkAccessRule(Clang_AST_CXTreeNode& treeNode);
			bool supportsASTObject(CXCursorKind kind);

			void addFunctionParameters(Clang_AST_CXTreeNode& treeNode);

			void analyzeVisibility(Clang_AST_CXTreeNode& treeNode);
			void analyzeChildrenVisibility(Clang_AST_CXTreeNode& treeNode);
			void connectASTObjects(Clang_AST_CXTreeNode& treeNode);

			ASTObject* createASTObjectForTreeNode(Clang_AST_CXTreeNode& treeNode);
			Clang_AST_CXTreeNode* createTreeNodeFromCursor(CXCursor cursor);
			Clang_AST_CXTreeNode* addTreeNodeFromCursor(CXCursor cursor, Clang_AST_CXTreeNode& parent);

			Clang_AST_CXTreeNode* m_rootTreeNode;
			std::map<CXCursor, Clang_AST_CXTreeNode*, CXCursor_less> m_canonicalCursorTreeNodeMap;

			VisibilityFilter m_filter;

			Logger m_logger;
	};
}

#endif // __CLANG_AST_HPP__