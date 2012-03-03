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

	/** Represents a compare class for comparing CXCursors
	 */
	struct CXCursor_less
	{
		bool operator()(CXCursor c1, CXCursor c2) const
		{ 
			return	c1.data[0] < c2.data[0] || 
				   (c1.data[0] == c2.data[0] && c1.data[1] < c2.data[1]) ||
				   (c1.data[0] == c2.data[0] && c1.data[1] == c2.data[1] && c1.data[2] < c2.data[2]);
		}
	};

	/** Represents a compare class for comparing CXTypes
	 */
	struct CXType_less
	{
		bool operator()(CXType t1, CXType t2) const
		{ 
			return	t1.data[0] < t2.data[0] || 
				(t1.data[0] == t2.data[0] && t1.data[1] < t2.data[1]);
		}
	};

	typedef std::map<CXCursor, ASTObject*, CXCursor_less> CXCursorASTObjectMap;

	/** Represents values for the access filter
	*/
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

	/** Represents the return of a checked visibility rule
	*/
	enum Rule_Success
	{
		/** Rule succeeded
		 */
		RULE_SUCCESS,

		/** Rule failed, go on with next sibling AST node
		 */
		RULE_FAIL,

		/** Rule failed, go on with firs child AST node
		 */
		RULE_FAIL_CHECK_CHILDREN
	};

	/** Represents a filter for excluding / including AST nodes in the simplified AST
	*/
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

	/** Represents a simplified Clang AST
	*/
	class Clang_AST
	{
		public:

			/** Constructor
	         */
			Clang_AST();

			/** Destructor
	         */
			~Clang_AST();

			/** Sets the translation unit
	         */
			void setTranslationUnit(CXTranslationUnit TU);

			/** Visitor function for visiting and analysing a CXCursor
			 *
			 * \param   cursor        Visited cursor
			 * \param   parent        Parent of visited cursor
			 * \param   client_data   Passed user data
			 *
			 * \return  Visit result to indicate if children should be visited or not
	         */
			CXChildVisitResult visitCursor(CXCursor cursor, CXCursor parent, CXClientData client_data);

			// C
			/** Creates a variable declaration ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Variable_Decl*   createVariableDecl(Clang_AST_CXTreeNode& treeNode);

			/** Creates a struct ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Struct*          createStruct(Clang_AST_CXTreeNode& treeNode);
			
			/** Creates a field ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Field*           createField(Clang_AST_CXTreeNode& treeNode);

			/** Creates a function ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Function*        createFunction(Clang_AST_CXTreeNode& treeNode);

			/** Creates a parameter ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Parameter*       createParameter(Clang_AST_CXTreeNode& treeNode);

			/** Creates a typedef ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Typedef*         createTypedef(Clang_AST_CXTreeNode& treeNode);

			// C++
			/** Creates a namespace ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Namespace*       createNamespace(Clang_AST_CXTreeNode& treeNode);

			/** Creates an enum ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Enum*            createEnum(Clang_AST_CXTreeNode& treeNode);

			/** Creates an enum constant ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_EnumConstant*    createEnumConstant(Clang_AST_CXTreeNode& treeNode);

			/** Creates an union ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Union*           createUnion(Clang_AST_CXTreeNode& treeNode);

			/** Creates a class ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Class*           createClass(Clang_AST_CXTreeNode& treeNode);

			/** Creates a constructor ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Constructor*     createConstructor(Clang_AST_CXTreeNode& treeNode);

			/** Creates a destructor ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Destructor*      createDestructor(Clang_AST_CXTreeNode& treeNode);

			/** Creates a member function ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_Member_Function* createMemberFunction(Clang_AST_CXTreeNode& treeNode);
			
			// C++: Templates
			/** Creates a template type parameter ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_TemplateTypeParameter*     createTemplateTypeParameter(Clang_AST_CXTreeNode& treeNode);

			/** Creates a template non type parameter ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_TemplateNonTypeParameter*  createTemplateNonTypeParameter(Clang_AST_CXTreeNode& treeNode);

			/** Creates a template template parameter ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_TemplateTemplateParameter* createTemplateTemplateParameter(Clang_AST_CXTreeNode& treeNode);

			/** Creates a template type argument ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_TemplateTypeArgument*        createTemplateTypeArgument(Clang_AST_CXTreeNode& treeNode);

			/** Creates a template declaration argument ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_TemplateDeclarationArgument* createTemplateDeclarationArgument(Clang_AST_CXTreeNode& treeNode);

			/** Creates a template integral argument ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_TemplateIntegralArgument*    createTemplateIntegralArgument(Clang_AST_CXTreeNode& treeNode);

			/** Creates a template template argument ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_TemplateTemplateArgument*    createTemplateTemplateArgument(Clang_AST_CXTreeNode& treeNode);

			/** Creates a template expression argument ASTObject and sets it as the ASTObject of the given tree node
			 *
			 * \param   treeNode        Tree node to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject_TemplateExpressionArgument*  createTemplateExpressionArgument(Clang_AST_CXTreeNode& treeNode);


			/** Returns the ASTType for the given cursor
			 *    - creates it, if it does not exist yet
			 *
			 * \param   cursor   Cursor to get ASTType for
			 *
			 * \return  ASTType of cursor
	         */
			ASTType* getASTTypeFromCursor(CXCursor cursor);

			/** Creates the ASTType for the given CXType
			 *
			 * \param   type   CXType to get ASTType for
			 * \param   src    Source cursor that lead to this type (used for debugging only)
			 *
			 * \return  ASTType for CXType
	         */
			ASTType* createASTType(CXType type, CXCursor src);

			/** Gets the ASTType for the given CXType
			 *    - creates it, if it does not exist yet
			 *
			 * \param   type   CXType to get ASTType for
			 * \param   src    Source cursor that lead to this type (used for debugging only)
			 *
			 * \return  ASTType for CXType
	         */
			ASTType* getASTType(CXType type, CXCursor src);

			/** Returns the parent cursor of the given cursor
			 *
			 * \param   cursor   Cursor to find parent for
			 *
			 * \return  Parent cursor
	         */
			CXCursor getParentCursor(CXCursor cursor);


			// temporary debugging functions
			void printTreeNode(ASTObject* node, int depth) const;
			void printTree() const;

			/** Returns the visibility filter that is currently set (used for simplifying the AST)
			 *
			 * \return   VisibilityFilter that is / was used
	         */
			const VisibilityFilter& getFilter() const { return m_filter; }

			/** Sets the visibility filter (used for simplifying the AST)
			 *
			 * \param   val   VisibilityFilter that will be used
	         */
			void setFilter(const VisibilityFilter& val) { m_filter = val; }

			/** Performs the creation and simplification of the AST
	         */
			void analyze();

			/** Returns the ASTTypes used in the AST
	         */
			const std::map<CXType, ASTType*, CXType_less>& getASTTypes() const { return m_typeMap; }

			/** Returns the tree node associated with the given cursor
			 *     - uses canonical cursor
			 *
			 * \param   cursor   Cursor to find tree node  for
			 *
			 * \return  TreeNode, nullptr if not found
	         */
			Clang_AST_CXTreeNode* getTreeNodeFromCursor(CXCursor cursor);

			/** Returns the root tree node
			 *
			 * \return  Root tree node
	         */
			Clang_AST_CXTreeNode* getRootTreeNode(){ return m_rootTreeNode; }

			/** Returns the tree node referenced by the given cursor
			 *     - uses canonical cursor
			 *     - creates the tree node, if it is not existing
			 *     - asserts when it can not create tree node
			 *
			 * \param   cursor   Cursor to find tree node  for
			 *
			 * \return  Tree node
	         */
			Clang_AST_CXTreeNode* getReferencedTreeNodeFromCursor(CXCursor cursor);
			
			/** Marks the given tree node (and thus all its ancestors) as referenced
			 *
			 * \param   treeNode   Tree node to mark
	         */
			void markTreeNodeAsReferenced(Clang_AST_CXTreeNode& treeNode);

			/** Returns the logger associated with this AST
			 *
			 * \return  Logger
	         */
			const Logger& getLogger() const { return m_logger; }
			Logger& getLogger(){ return m_logger; }

		protected:

			// Helper functions
			/** Sets information about base classes of the ASTObject associated with this treeNode
			 *
			 * \param   treeNode   Tree node set base information for
	         */
			void setBaseInformation(Clang_AST_CXTreeNode& treeNode);

			/** Sets template information based on the given cursor and its parent
			 *
			 * \param   templateInfo   Template information to update
			 * \param   cursor         Cursor to retrieve information from
			 * \param   astParent      Parent ASTObject // TODO: remove as not used
	         */
			void setTemplateInformation(ASTObjectHelper_Template& templateInfo, CXCursor cursor, ASTObject* astParent);

			// TODO: rename
			/** Checks the filename rule on the given treeNode
			 *
			 * \param   treeNode   Tree node to check rule on
			 *
			 * \return  Result of the rule
	         */
			Rule_Success checkFileRule(Clang_AST_CXTreeNode& treeNode);

			// TODO: rename
			/** Checks the symbolname rule on the given treeNode
			 *
			 * \param   treeNode   Tree node to check rule on
			 *
			 * \return  Result of the rule
	         */
			Rule_Success checkNameRule(Clang_AST_CXTreeNode& treeNode);

			/** Checks the access rule on the given treeNode
			 *
			 * \param   treeNode   Tree node to check rule on
			 *
			 * \return  Result of the rule
	         */
			Rule_Success checkAccessRule(Clang_AST_CXTreeNode& treeNode);

			/** Checks if an ASTObject can be created for the given cursor kind
			 *
			 * \param   kind   Kind to check
			 *
			 * \return  True if ASTObject can be created, otherwise false
	         */
			bool supportsASTObject(CXCursorKind kind);

			/** Adds function parameters to the ASTObject of the given treeNode
			 *
			 * \param   treeNode   Tree node of ASTObject
	         */
			void addFunctionParameters(Clang_AST_CXTreeNode& treeNode);

			/** Analyzes the visibility of the given tree node based on different rules
			 *    - based on the result of the rule, it may analyze the children
			 *
			 * \param   treeNode   Tree node to analyze
	         */
			void analyzeVisibility(Clang_AST_CXTreeNode& treeNode);

			/** Analyzes the visibility of the children of the given tree node based on different rules
			 *
			 * \param   treeNode   Tree node to analyze children for
	         */
			void analyzeChildrenVisibility(Clang_AST_CXTreeNode& treeNode);

			/** Connects the ASTObjects of the tree node and the child tree nodes
			 *
			 * \param   treeNode   Tree node to connect ASTObjects on
	         */
			void connectASTObjects(Clang_AST_CXTreeNode& treeNode);

			/** Creates the ASTObject for the tree node based on the canonical cursors kind
			 *
			 * \param   treeNode   TreeNode to create ASTObject for
			 *
			 * \return  Newly created ASTObject
	         */
			ASTObject* createASTObjectForTreeNode(Clang_AST_CXTreeNode& treeNode);

			/** Creates a tree node based on the given cursor
			 *
			 * \param   cursor   Cursor to create tree node for
			 *
			 * \return  Newly created tree node
	         */
			Clang_AST_CXTreeNode* createTreeNodeFromCursor(CXCursor cursor);

			/** Creates a tree node based on the given cursor and adds it to the given parent tree node
			 *
			 * \param   cursor   Cursor to create tree node for
			 * \param   parent   Parent to add tree node to
			 *
			 * \return  Newly created tree node
	         */
			Clang_AST_CXTreeNode* addTreeNodeFromCursor(CXCursor cursor, Clang_AST_CXTreeNode& parent);

			Clang_AST_CXTreeNode* m_rootTreeNode;
			std::map<CXCursor, Clang_AST_CXTreeNode*, CXCursor_less> m_canonicalCursorTreeNodeMap;
			std::map<CXType, ASTType*, CXType_less> m_typeMap;

			VisibilityFilter m_filter;

			Logger m_logger;
	};
}

#endif // __CLANG_AST_HPP__