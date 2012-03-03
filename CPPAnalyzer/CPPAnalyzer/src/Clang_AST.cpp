
#include "Clang_AST.hpp"
#include "Clang_AST_CXTree.hpp"
#include "SelfDisposingCXString.hpp"
#include "clang_helpers.hpp"

#include "ASTObject_Namespace.hpp"
#include "ASTObject_Struct.hpp"
#include "ASTObject_Class.hpp"
#include "ASTObject_Field.hpp"
#include "ASTObject_Function.hpp"
#include "ASTObject_Member_Function.hpp"
#include "ASTObject_Parameter.hpp"
#include "ASTObject_Constructor.hpp"
#include "ASTObject_Destructor.hpp"
#include "ASTObject_Typedef.hpp"
#include "ASTObject_Enum.hpp"
#include "ASTObject_TemplateArgument.hpp"
#include "ASTObject_TemplateParameter.hpp"
#include "ASTObject_Union.hpp"

#include <iostream>
#include <assert.h>

using std::string;
using std::vector;

// TODO: move
#include <sstream>

template <class T>
inline std::string to_string (const T& t)
{
	std::stringstream ss;
	ss << t;
	return ss.str();
}


namespace CPPAnalyzer
{
	std::string CXStringToStdStringAndFree(CXString cxString)
	{
		std::string result(clang_getCString(cxString));
		clang_disposeString(cxString);
		return result;
	}

	CXChildVisitResult printVisitor(CXCursor cursor, CXCursor parent, CXClientData client_data)
	{
		return static_cast<Clang_AST*>(client_data)->visitCursor(cursor, parent, client_data);
	}

	void setStandardProperties(const Clang_AST_CXTreeNode& treeNode, ASTObject* astObject)
	{
		CXCursor canonicalCursor = treeNode.getCanonicalCursor();

		SelfDisposingCXString USR(clang_getCursorUSR(canonicalCursor));
		astObject->setUSR(USR.c_str());

		SelfDisposingCXString fullName(clang_getCursorDisplayName(canonicalCursor));
		astObject->setDisplayName(fullName.c_str());

		auto& cursors = treeNode.getCursors();
		for(auto it = cursors.begin(), end = cursors.end(); it != end; ++it)
		{
			auto cursor = *it;
			auto location = getSourceLocationFromCursor(cursor);

			if(clang_isCursorDefinition(cursor))
				astObject->setDefinition(location);
			else if(clang_isDeclaration(cursor.kind))
				astObject->addDeclaration(location);
		}
	}

	// just dirty for testing
	void Clang_AST::printTreeNode(ASTObject* node, int depth) const
	{
		std::string line;
		for(int i = 1; i <= depth; ++i)
			line += "  ";

		line += getASTObjectKind(node->getKind());
		line += ": ";
		line += to_string(node->getID());
		line += " ";
		line += ((node->getNodeName() != "" ) ? node->getNodeName() : "anonymous");

		std::cout << line << std::endl;
		auto& children = node->getChildren();

		auto end = children.end();
		for(auto it = children.begin(); it != end; ++it)
		{
			printTreeNode(*it, depth + 1);
		}
	}

	void Clang_AST::printTree() const
	{
		printTreeNode(m_rootTreeNode->getASTObject(), 0);
	}

	void printCursorInfo(CXCursor cursor, const std::string& prefix = "", bool fileInfo = true)
	{
		auto pKindSpellingC = std::string(SelfDisposingCXString(clang_getCursorKindSpelling(cursor.kind)).c_str());
		auto pDisplayNameC = std::string(SelfDisposingCXString(clang_getCursorDisplayName(cursor)).c_str());

		std::cout << prefix.c_str() << pKindSpellingC.c_str() << ": " << pDisplayNameC.c_str() << " ";

		if(fileInfo)
		{
			auto location = getSourceLocationFromCursor(cursor);
			std::cout << "\n\t\t in " << location.fileName << ":" << location.line << ":" << location.column;
		}
			
		std::cout << "\n";
	}

	// ==================================================================================================================================

	Clang_AST::Clang_AST()
		: m_filter(".*", ".*", ALL)
	{
		m_rootTreeNode = new Clang_AST_CXTreeNode();
		m_rootTreeNode->setASTObject(new ASTObject_Namespace(""));
		m_rootTreeNode->setVisibility(VISIBILITY_VISIBLE);
	}

	Clang_AST::~Clang_AST()
	{
		// cleaning tree
		delete m_rootTreeNode;
		
		// cleaning types
		for(auto it = m_typeMap.begin(), end = m_typeMap.end(); it != end; ++it)
			delete it->second;

		m_typeMap.clear();
	}


	void Clang_AST::setTranslationUnit(CXTranslationUnit TU)
	{
		assert(TU != nullptr);

		delete m_rootTreeNode;

		auto tuCursor = clang_getTranslationUnitCursor(TU);
		m_rootTreeNode = createTreeNodeFromCursor(tuCursor);
		m_rootTreeNode->setASTObject(new ASTObject_Namespace(""));
		m_rootTreeNode->setVisibility(VISIBILITY_VISIBLE);

		// Diagnostics, TODO: put into diagnostics-logger!
		for (unsigned i = 0, numDiag = clang_getNumDiagnostics(TU); i != numDiag; ++i)
		{
			CXDiagnostic diag = clang_getDiagnostic(TU, i);
			SelfDisposingCXString diagText(clang_formatDiagnostic(diag, clang_defaultDiagnosticDisplayOptions()));

			switch(clang_getDiagnosticSeverity(diag))
			{
				case CXDiagnostic_Warning:
					m_logger.addWarning(diagText.c_str());
					break;
				case CXDiagnostic_Error:
				case CXDiagnostic_Fatal:
					m_logger.addError(diagText.c_str());
					break;
				default:
					m_logger.addInfo(diagText.c_str());
					break;
			}
		}


		clang_visitChildren(tuCursor, printVisitor, this);
		this->analyze();
	}



	/** Creates a TreeNode from a cursor
	 *
	 * \param 	cursor Cursor to create node from
	 * \return	Newly created TreeNode
	 */
	Clang_AST_CXTreeNode* Clang_AST::createTreeNodeFromCursor(CXCursor cursor)
	{
		assert(getTreeNodeFromCursor(cursor) == nullptr && "Cursor has already been registered");
		assert(!clang_Cursor_isNull(cursor)             && "Cursor is null");
		
		// creating the node
		auto treeNode = new Clang_AST_CXTreeNode();
		auto canonicalCursor = clang_getCanonicalCursor(cursor);
		treeNode->setCanonicalCursor(canonicalCursor);
		treeNode->addCursor(cursor);
		
		// registering the node
		m_canonicalCursorTreeNodeMap.insert(std::pair<CXCursor, Clang_AST_CXTreeNode*>(canonicalCursor, treeNode));

		return treeNode;
	}

	/** Creates a TreeNode from a cursor and adds it to the given TreeNode parent
	 *
	 * \param 	cursor Cursor to create node from
	 * \param 	parent TreeNode to add node to
	 * \return	Newly created TreeNode
	 */
	Clang_AST_CXTreeNode* Clang_AST::addTreeNodeFromCursor(CXCursor cursor, Clang_AST_CXTreeNode& parent)
	{
		auto treeNode = createTreeNodeFromCursor(cursor);
		parent.addChild(treeNode);
		return treeNode;
	}

	/** Returns a TreeNode given a cursor
	 *
	 * \param 	cursor Cursor to get node for
	 * \return	Found TreeNode, nullptr if not found
	 */
	Clang_AST_CXTreeNode* Clang_AST::getTreeNodeFromCursor(CXCursor cursor)
	{
		auto canonicalCursor = clang_getCanonicalCursor(cursor);

		auto itCanonicalCursor = m_canonicalCursorTreeNodeMap.find(canonicalCursor);

		return (itCanonicalCursor == m_canonicalCursorTreeNodeMap.end()) ? nullptr : itCanonicalCursor->second;
	}

	void Clang_AST::markTreeNodeAsReferenced(Clang_AST_CXTreeNode& treeNode)
	{
		if(treeNode.getVisibility() == VISIBILITY_NONE)
		{
			// set visibility
			treeNode.setVisibility(VISIBILITY_REFERENCED);

			// create object
			if(supportsASTObject(treeNode.getCanonicalCursor().kind))
				createASTObjectForTreeNode(treeNode);

			auto parentNode = treeNode.getParentNode();
			if(parentNode)
			{
				markTreeNodeAsReferenced(*parentNode);
			}
		}
	}

	Clang_AST_CXTreeNode* Clang_AST::getReferencedTreeNodeFromCursor(CXCursor cursor)
	{
		auto treeNode = getTreeNodeFromCursor(cursor);

		// if the node exists, just return it
		if(treeNode)
		{
			markTreeNodeAsReferenced(*treeNode);
			return treeNode;
		}

		// some nodes may not exist, so we need to create them
		
		// 1. find an appropriate parent
		CXCursor parentCursor = clang_getCursorSemanticParent(cursor);
		auto parentNode = getTreeNodeFromCursor(parentCursor);

		if(!parentNode)
		{
			parentCursor = clang_getCursorLexicalParent(cursor);
			parentNode = getTreeNodeFromCursor(parentCursor);
		}

		assert(parentNode != nullptr);

		treeNode = addTreeNodeFromCursor(cursor, *parentNode);
		markTreeNodeAsReferenced(*treeNode);

		return treeNode;
	}

	/** Visits all cursors and saves them inside a tree structure
	 *
	 * \param 	cursor 
	 * \param 	parent 
	 * \param 	client_data 
	 * \return	
	 */
	CXChildVisitResult Clang_AST::visitCursor(CXCursor cursor, CXCursor parent, CXClientData client_data)
	{
		auto parentTreeNode = getTreeNodeFromCursor(parent);
		assert(parentTreeNode != nullptr);

		auto existingNode = getTreeNodeFromCursor(cursor);
		if(existingNode)
		{
			existingNode->addCursor(cursor);
			return CXChildVisit_Recurse;
		}
		
		// differ between the cursors
		switch(cursor.kind)
		{
			// C
			case CXCursor_VarDecl:
				{
					// we only want static fields and global variables
					switch(parent.kind)
					{
						// static fields
						case CXCursor_StructDecl:
						case CXCursor_ClassDecl:
						case CXCursor_ClassTemplate:
						case CXCursor_ClassTemplatePartialSpecialization:

						// global variables
						case CXCursor_Namespace:
						case CXCursor_TranslationUnit:
						case CXCursor_LinkageSpec:
							addTreeNodeFromCursor(cursor, *parentTreeNode);
							return CXChildVisit_Continue;
						default:
							return CXChildVisit_Continue;

					}
				}
			case CXCursor_UnionDecl:
			case CXCursor_TypedefDecl:
			case CXCursor_StructDecl:
			case CXCursor_FunctionDecl:
			case CXCursor_ParmDecl:
			case CXCursor_FieldDecl:

			// C++
			case CXCursor_Namespace:
			case CXCursor_ClassDecl:
			case CXCursor_Constructor:
			case CXCursor_Destructor:
			case CXCursor_CXXMethod:
			case CXCursor_CXXBaseSpecifier: // TODO: remove
			case CXCursor_EnumDecl:
			case CXCursor_EnumConstantDecl:
			case CXCursor_LinkageSpec:
			

			// C++: Templates
			case CXCursor_ClassTemplate:
			case CXCursor_ClassTemplatePartialSpecialization:
			case CXCursor_FunctionTemplate:

			case CXCursor_TemplateTypeParameter:
			case CXCursor_NonTypeTemplateParameter:
			case CXCursor_TemplateTemplateParameter:
			case CXCursor_TemplateNullArgument:
			case CXCursor_TemplateTypeArgument:
			case CXCursor_TemplateDeclarationArgument:
			case CXCursor_TemplateIntegralArgument:
			case CXCursor_TemplateTemplateArgument:
			case CXCursor_TemplateTemplateExpansionArgument:
			case CXCursor_TemplateExpressionArgument:
			case CXCursor_TemplatePackArgument:
				addTreeNodeFromCursor(cursor, *parentTreeNode);
				return CXChildVisit_Recurse;
			
			default: 
				return CXChildVisit_Continue;
		}
		
		return CXChildVisit_Recurse;
	}

	void Clang_AST::analyze()
	{
		analyzeVisibility(*m_rootTreeNode);

		// connecting the objects
		auto& children = m_rootTreeNode->getChildren();
		for (auto it = children.begin(), end = children.end(); it != end; ++it)
			connectASTObjects(**it);
	}

	bool isContainerKind(CXCursorKind kind)
	{
		switch(kind)
		{
			case CXCursor_Namespace:
			case CXCursor_ClassDecl:
			case CXCursor_StructDecl:
			case CXCursor_EnumDecl:
			case CXCursor_ClassTemplate:
			case CXCursor_ClassTemplatePartialSpecialization:
			case CXCursor_LinkageSpec:
			case CXCursor_TranslationUnit:
				return true;

			default:
				return false;
		}
	}

	bool checkCreateASTObject(CXCursorKind kind)
	{
		return true;
	}

	Rule_Success Clang_AST::checkFileRule(Clang_AST_CXTreeNode& treeNode)
	{
		auto canonicalCursor = treeNode.getCanonicalCursor();
		auto success = RULE_FAIL;
		
		bool foundRule = false;
		auto& fileNames = treeNode.getFileNames();
		for (auto it = fileNames.begin(), end = fileNames.end(); it != end; ++it)
		{
			std::string val = *it;
			if(canonicalCursor.kind == CXCursor_TranslationUnit || std::regex_match(*it, m_filter.fileFilter))
			{
				success = RULE_SUCCESS;
				break;
			}
		}

		return success;
	}

	Rule_Success Clang_AST::checkNameRule(Clang_AST_CXTreeNode& treeNode)
	{
		auto canonicalCursor = treeNode.getCanonicalCursor();

		switch(canonicalCursor.kind)
		{
			// no children
			case CXCursor_VarDecl:
			case CXCursor_UnionDecl:
			case CXCursor_TypedefDecl:
			case CXCursor_FunctionDecl:
			case CXCursor_FieldDecl:
			case CXCursor_Constructor:
			case CXCursor_Destructor:
			case CXCursor_EnumConstantDecl:
			case CXCursor_CXXMethod:
			case CXCursor_FunctionTemplate:
				return (std::regex_match(treeNode.getFullName(), m_filter.nameFilter))  ? RULE_SUCCESS : RULE_FAIL;

			// children
			case CXCursor_Namespace:
			case CXCursor_ClassDecl:
			case CXCursor_StructDecl:
			case CXCursor_EnumDecl:
			case CXCursor_ClassTemplate:
			case CXCursor_ClassTemplatePartialSpecialization:
				return (std::regex_match(treeNode.getFullName(), m_filter.nameFilter))  ? RULE_SUCCESS : RULE_FAIL_CHECK_CHILDREN;

			case CXCursor_LinkageSpec:
			case CXCursor_TranslationUnit:
				return RULE_FAIL_CHECK_CHILDREN;

			default:
				return RULE_FAIL;
		}
	}

	Rule_Success Clang_AST::checkAccessRule(Clang_AST_CXTreeNode& treeNode)
	{
		auto canonicalCursor = treeNode.getCanonicalCursor();
		
		auto access = clang_getCXXMemberAccessSpecifier(canonicalCursor);

		// we can only check for access if it has access
		if(access != CX_CXXInvalidAccessSpecifier)
		{
			switch(m_filter.accessFilter)
			{
			case NONE:
				return RULE_FAIL;
			case PRIVATE:
				if(access != CX_CXXPrivate)
					return RULE_FAIL;
				break;
			case PROTECTED:
				if(access != CX_CXXProtected)
					return RULE_FAIL;
				break;
			case PUBLIC:
				if(access != CX_CXXPublic)
					return RULE_FAIL;
				break;
			case PRIVATE_PROTECTED:
				if(access == CX_CXXPublic)
					return RULE_FAIL;
				break;
			case PRIVATE_PUBLIC:
				if(access == CX_CXXProtected)
					return RULE_FAIL;
				break;
			case PROTECTED_PUBLIC:
				if(access == CX_CXXPrivate)
					return RULE_FAIL;
				break;
			case PRIVATE_PROTECTED_PUBLIC:
				break;
			}
		}

		return RULE_SUCCESS;
	}

	bool Clang_AST::supportsASTObject(CXCursorKind kind)
	{
		switch(kind)
		{
			// C
			case CXCursor_VarDecl:
			case CXCursor_UnionDecl:
			case CXCursor_TypedefDecl:
			case CXCursor_StructDecl:
			case CXCursor_FunctionDecl:
			case CXCursor_ParmDecl:
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

			case CXCursor_TemplateTypeParameter:
			case CXCursor_NonTypeTemplateParameter:
			case CXCursor_TemplateTemplateParameter:
			case CXCursor_TemplateNullArgument:
			case CXCursor_TemplateTypeArgument:
			case CXCursor_TemplateDeclarationArgument:
			case CXCursor_TemplateIntegralArgument:
			case CXCursor_TemplateTemplateArgument:
			case CXCursor_TemplateTemplateExpansionArgument:
			case CXCursor_TemplateExpressionArgument:
			case CXCursor_TemplatePackArgument:
				return true;

			default: 
				return false;
		}
	}

	void Clang_AST::analyzeVisibility(Clang_AST_CXTreeNode& treeNode)
	{
		auto canonicalCursor = treeNode.getCanonicalCursor();

		// let's see if we actually want to check the visibility rules
		switch(canonicalCursor.kind)
		{
			case CXCursor_TranslationUnit:

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
			case CXCursor_LinkageSpec:

			// C++: Templates
			case CXCursor_ClassTemplate:
			case CXCursor_ClassTemplatePartialSpecialization:
			case CXCursor_FunctionTemplate:
				break;
			default:
				return;
		}

		// checking file-rule
		if(checkFileRule(treeNode) != RULE_SUCCESS) // we'll see about that!
			return;

		// checking name-rule
		switch(checkNameRule(treeNode))
		{
			case RULE_FAIL:
				return;
			case RULE_FAIL_CHECK_CHILDREN:
				analyzeChildrenVisibility(treeNode);
				return;
			default:
				break;
		}

		// checking access-rule
		if(checkAccessRule(treeNode) != RULE_SUCCESS)
			return;

		// if we got here, we're setting the visibility 
		treeNode.setVisibility(VISIBILITY_VISIBLE);

		if(supportsASTObject(canonicalCursor.kind))
		{
			// create the ASTObject, if it hasn't been created before by a reference
			if(!treeNode.getASTObject())
			{
				createASTObjectForTreeNode(treeNode);

				auto parentNode = treeNode.getParentNode();
				if(parentNode)
					markTreeNodeAsReferenced(*parentNode);
			}
		}

		// and depending on the rule, we may check the children
		analyzeChildrenVisibility(treeNode);
	}

	void Clang_AST::analyzeChildrenVisibility(Clang_AST_CXTreeNode& treeNode)
	{
		if(isContainerKind(treeNode.getCanonicalCursor().kind))
		{
			auto children = treeNode.getChildren(); // intended copy, as new nodes may be inserted!
			for (auto it = children.begin(), end = children.end(); it != end; ++it)
				analyzeVisibility(**it);
		}
	}

	ASTObject* Clang_AST::createASTObjectForTreeNode(Clang_AST_CXTreeNode& treeNode)
	{
		assert(treeNode.getASTObject() == nullptr  && "ERROR: TreeNode already has ASTObject");
		assert(treeNode.getParentNode() != nullptr && "ERROR: Don't create ASTObjects for TreeNodes that are not in the tree!");

		auto canonicalCursor = treeNode.getCanonicalCursor();
		Clang_AST_CXTreeNode& parentNode = *(treeNode.getParentNode());


		ASTObject* astObject = nullptr;

		// differ between the cursors
		switch(canonicalCursor.kind)
		{
			// C
			case CXCursor_VarDecl:
				{
					// we only want static fields and global variables
					switch(parentNode.getCanonicalCursor().kind)
					{
						// static fields
						case CXCursor_StructDecl:
						case CXCursor_ClassDecl:
						case CXCursor_ClassTemplate:
						case CXCursor_ClassTemplatePartialSpecialization:
							astObject = createField(treeNode);
							break;

						// global variables
						case CXCursor_Namespace:
						case CXCursor_TranslationUnit:
						case CXCursor_LinkageSpec:
							astObject = createVariableDecl(treeNode);
							break;
						default:
							break;
					}
					break;
				}
			case CXCursor_UnionDecl:
				astObject = createUnion(treeNode);
				break;
			case CXCursor_TypedefDecl:
				astObject = createTypedef(treeNode);
				break;
			case CXCursor_StructDecl:
				astObject = createStruct(treeNode);
				break;
			case CXCursor_FunctionDecl:
				astObject = createFunction(treeNode);
				break;
			case CXCursor_ParmDecl:
				astObject = createParameter(treeNode);
				break;
			case CXCursor_FieldDecl:
				astObject = createField(treeNode);
				break;

			// C++
			case CXCursor_Namespace:
				astObject = createNamespace(treeNode);
				break;
			case CXCursor_ClassDecl:
				astObject = createClass(treeNode);
				break;
			case CXCursor_Constructor:
				astObject = createConstructor(treeNode);
				break;
			case CXCursor_Destructor:
				astObject = createDestructor(treeNode);
				break;
			case CXCursor_CXXMethod:
				astObject = createMemberFunction(treeNode);
				break;
			case CXCursor_EnumDecl:
				astObject = createEnum(treeNode);
				break;
			case CXCursor_EnumConstantDecl:
				astObject = createEnumConstant(treeNode);
				break;

			// C++: Templates
			case CXCursor_ClassTemplate:
				astObject = createClass(treeNode);
				break;
			case CXCursor_ClassTemplatePartialSpecialization:
				astObject = createClass(treeNode);
				break;
			case CXCursor_FunctionTemplate:
				astObject = createFunction(treeNode);
				break;

			case CXCursor_TemplateTypeParameter:
				astObject = createTemplateTypeParameter(treeNode);
				break;
			case CXCursor_NonTypeTemplateParameter:
				astObject = createTemplateNonTypeParameter(treeNode);
				break;
			case CXCursor_TemplateTemplateParameter:
				astObject = createTemplateTemplateParameter(treeNode);
				break;
			case CXCursor_TemplateNullArgument:
				// TODO
				break;
			case CXCursor_TemplateTypeArgument:
				astObject = createTemplateTypeArgument(treeNode);
				break;
			case CXCursor_TemplateDeclarationArgument:
				astObject = createTemplateDeclarationArgument(treeNode);
				break;
			case CXCursor_TemplateIntegralArgument:
				astObject = createTemplateIntegralArgument(treeNode);
				break;
			case CXCursor_TemplateTemplateArgument:
				astObject = createTemplateTemplateArgument(treeNode);
				break;
			case CXCursor_TemplateTemplateExpansionArgument:
				// TODO
				break;
			case CXCursor_TemplateExpressionArgument:
				astObject = createTemplateExpressionArgument(treeNode);
				break;
			case CXCursor_TemplatePackArgument:
				// TODO
				break;

			default: 
				break;
		}

		assert(astObject != nullptr && "ERROR: Could not create ASTObject for TreeNode");
		//treeNode.setASTObject(astObject);

		return astObject;
	}

	// TODO: move
	ASTObjectAccess convertClangAccess(CX_CXXAccessSpecifier access)
	{
		switch(access)
		{
			case CX_CXXPrivate:
				return ACCESS_PRIVATE;
			case CX_CXXProtected:
				return ACCESS_PROTECTED;
			case CX_CXXPublic:
				return ACCESS_PUBLIC;
			default:
				return ACCESS_INVALID;
		}
	}


	ASTObject_Variable_Decl* Clang_AST::createVariableDecl(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Variable_Decl* astObject = new ASTObject_Variable_Decl(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// Variable properties
		astObject->setType(getASTTypeFromCursor(cursor));

		return astObject;
	}

	ASTObject_Struct* Clang_AST::createStruct(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Struct* astObject = new ASTObject_Struct(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// base information
		setBaseInformation(treeNode);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);
		
		return astObject;
	}

	ASTObject_Field* Clang_AST::createField(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Field* astObject = new ASTObject_Field(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// Field properties
		astObject->setAccess(convertClangAccess(clang_getCXXMemberAccessSpecifier(cursor)));
		astObject->setType(getASTTypeFromCursor(cursor));
		
		return astObject;
	}


	void Clang_AST::addFunctionParameters(Clang_AST_CXTreeNode& treeNode)
	{
		CXType funcType = clang_getCursorType(treeNode.getCanonicalCursor());
		unsigned numArgs = clang_getNumArgTypes(funcType);

		unsigned numAdded = 0;
		auto& children = treeNode.getChildren();
		for(auto it = children.begin(), end = children.end(); it != end; ++it)
		{
			if(numAdded == numArgs)
				break;

			Clang_AST_CXTreeNode* childNode = *it;
			if(childNode->getCanonicalCursor().kind == CXCursor_ParmDecl)
			{
				childNode->setVisibility(VISIBILITY_VISIBLE);
				createASTObjectForTreeNode(*childNode);
				++numAdded;
			}
		}
	}

	ASTObject_Function* Clang_AST::createFunction(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Function* astObject = new ASTObject_Function(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);

		// Function properties
		CXType returnType = clang_getCursorResultType(cursor);
		astObject->setReturnType(getASTType(returnType, cursor));

		addFunctionParameters(treeNode);

		return astObject;
	}

	ASTObject_Parameter* Clang_AST::createParameter(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Parameter* astObject = new ASTObject_Parameter(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// Parameter properties
		astObject->setType(getASTTypeFromCursor(cursor));

		return astObject;
	}

	ASTObject_Typedef* Clang_AST::createTypedef(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Typedef* astObject = new ASTObject_Typedef(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// Typedef properties
		CXType type = clang_getTypedefDeclUnderlyingType(cursor);

		auto tmpLocation = getSourceLocationFromCursor(cursor);

		astObject->setType(getASTType(type, cursor));

		return astObject;
	}

	ASTObject_Namespace* Clang_AST::createNamespace(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Namespace* astObject = new ASTObject_Namespace(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);
		
		return astObject;
	}

	ASTObject_Enum* Clang_AST::createEnum(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Enum* astObject = new ASTObject_Enum(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		return astObject;
	}

	ASTObject_EnumConstant* Clang_AST::createEnumConstant(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_EnumConstant* astObject = new ASTObject_EnumConstant(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// EnumConstant properties
		astObject->setValue(clang_getEnumConstantDeclValue(cursor));

		return astObject;
	}

	ASTObject_Union* Clang_AST::createUnion(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Union* astObject = new ASTObject_Union(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		return astObject;
	}

	ASTObject_Class* Clang_AST::createClass(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Class* astObject = new ASTObject_Class(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// base information
		setBaseInformation(treeNode);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);

		return astObject;
	}

	ASTObject_Constructor* Clang_AST::createConstructor(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Constructor* astObject = new ASTObject_Constructor(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);	

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);

		// Constructor properties
		astObject->setAccess(convertClangAccess(clang_getCXXMemberAccessSpecifier(cursor)));

		addFunctionParameters(treeNode);
		
		return astObject;
	}

	ASTObject_Destructor* Clang_AST::createDestructor(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Destructor* astObject = new ASTObject_Destructor(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);
		
		// Destructor properties
		astObject->setAccess(convertClangAccess(clang_getCXXMemberAccessSpecifier(cursor)));

		return astObject;
	}

	ASTObject_Member_Function* Clang_AST::createMemberFunction(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Member_Function* astObject = new ASTObject_Member_Function(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);

		// Member function properties
		CXType returnType = clang_getCursorResultType(cursor);

		astObject->setAccess(convertClangAccess(clang_getCXXMemberAccessSpecifier(cursor)));
		astObject->setReturnType(getASTType(returnType, cursor));
		astObject->setVirtual(clang_CXXMethod_isVirtual(cursor) != 0);
		astObject->setStatic(clang_CXXMethod_isStatic(cursor) != 0);
		astObject->setConst(clang_CXXMethod_isConst(cursor) != 0);

		addFunctionParameters(treeNode);

		return astObject;
	}

	ASTObject_TemplateTypeParameter* Clang_AST::createTemplateTypeParameter(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTypeParameter* astObject = new ASTObject_TemplateTypeParameter(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		return astObject;
	}

	ASTObject_TemplateNonTypeParameter* Clang_AST::createTemplateNonTypeParameter(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateNonTypeParameter* astObject = new ASTObject_TemplateNonTypeParameter(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		return astObject;
	}

	ASTObject_TemplateTemplateParameter* Clang_AST::createTemplateTemplateParameter(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTemplateParameter* astObject = new ASTObject_TemplateTemplateParameter(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		return astObject;
	}

	ASTObject_TemplateTypeArgument* Clang_AST::createTemplateTypeArgument(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTypeArgument* astObject = new ASTObject_TemplateTypeArgument(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		astObject->setType(getASTType(clang_getTemplateArgumentValueAsType(cursor), cursor));

		return astObject;
	}

	ASTObject_TemplateDeclarationArgument* Clang_AST::createTemplateDeclarationArgument(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateDeclarationArgument* astObject = new ASTObject_TemplateDeclarationArgument(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		ASTObject* decl = getReferencedTreeNodeFromCursor(clang_getTemplateArgumentValueAsDeclaration(cursor))->getASTObject();

		astObject->setDeclaration(decl);

		return astObject;
	}

	ASTObject_TemplateIntegralArgument* Clang_AST::createTemplateIntegralArgument(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateIntegralArgument* astObject = new ASTObject_TemplateIntegralArgument(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		astObject->setIntegral(clang_getTemplateArgumentValueAsIntegral(cursor));

		return astObject;
	}

	ASTObject_TemplateTemplateArgument* Clang_AST::createTemplateTemplateArgument(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTemplateArgument* astObject = new ASTObject_TemplateTemplateArgument(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		ASTObject* decl = getReferencedTreeNodeFromCursor(clang_getTemplateArgumentValueAsTemplate(cursor))->getASTObject();
		astObject->setTemplate(decl);

		return astObject;
	}

	ASTObject_TemplateExpressionArgument* Clang_AST::createTemplateExpressionArgument(Clang_AST_CXTreeNode& treeNode)
	{
		// Common properties
		CXCursor cursor = treeNode.getCanonicalCursor();
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateExpressionArgument* astObject = new ASTObject_TemplateExpressionArgument(nodeName.c_str());
		treeNode.setASTObject(astObject);
		setStandardProperties(treeNode, astObject);

		return astObject;
	}

	void Clang_AST::setTemplateInformation(ASTObjectHelper_Template& templateInfo, CXCursor cursor, ASTObject* astObject)
	{
		ASTObjectTemplateKind templateKind = TEMPLATE_KIND_NON_TEMPLATE;
		CXCursor templateCursor;

		switch(cursor.kind)
		{
			case CXCursor_StructDecl:
			case CXCursor_ClassDecl:
		
			case CXCursor_FunctionDecl:
			case CXCursor_CXXMethod:
			case CXCursor_Constructor:
			case CXCursor_Destructor: 
				{
					templateCursor = clang_getSpecializedCursorTemplate(cursor);
					if(clang_Cursor_isNull(templateCursor))
						templateKind = TEMPLATE_KIND_NON_TEMPLATE;
					else
						templateKind = TEMPLATE_KIND_SPECIALIZATION;
					break;
				}

			case CXCursor_ClassTemplate:
			case CXCursor_FunctionTemplate: templateKind = TEMPLATE_KIND_TEMPLATE; break;

			case CXCursor_ClassTemplatePartialSpecialization: 
				{
					templateCursor = clang_getSpecializedCursorTemplate(cursor);
					assert(!clang_Cursor_isNull(templateCursor));
					templateKind = TEMPLATE_KIND_PARTIAL_SPECIALIZATION; 
					break;
				}
		}

		templateInfo.setKind(templateKind);

		if(templateKind == TEMPLATE_KIND_TEMPLATE || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			// setting parameters
			unsigned numParams = clang_getTemplateNumParameters(cursor);

			assert(numParams != UINT_MAX);

			for(unsigned i = 0; i < numParams; ++i)
			{
				CXCursor paramCursor = clang_getTemplateParameter(cursor, i);
				ASTObject_TemplateParameter* paramASTObject = static_cast<ASTObject_TemplateParameter*>(getReferencedTreeNodeFromCursor(paramCursor)->getASTObject());
				templateInfo.addParameter(paramASTObject);
			}

		}

		if(templateKind == TEMPLATE_KIND_SPECIALIZATION || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			// setting template
			ASTObject* templDecl = getReferencedTreeNodeFromCursor(templateCursor)->getASTObject();
			templateInfo.setTemplateDeclaration(templDecl);

			// setting arguments
			unsigned numArgs = clang_getTemplateSpecializationNumArguments(cursor);
			assert(numArgs != UINT_MAX);

			for(unsigned i = 0; i < numArgs; ++i)
			{
				CXCursor argCursor = clang_getTemplateSpecializationArgument(cursor, i);
				ASTObject_TemplateArgument* argASTObject = static_cast<ASTObject_TemplateArgument*>(getReferencedTreeNodeFromCursor(argCursor)->getASTObject());
				templateInfo.addArgument(argASTObject);
			}
		}
	}

	ASTType* Clang_AST::getASTTypeFromCursor(CXCursor cursor)
	{
		CXType type = clang_getCursorType(cursor);
		return getASTType(type, cursor);
	}

	bool isBuggyType(CXType type)
	{
		while(true)
		{
			switch(type.kind)
			{
				case CXType_TemplateTypeParm:
				case CXType_TemplateSpecialization:
					return true;
				case CXType_Pointer:
				case CXType_LValueReference:
					type = clang_getPointeeType(type);
					break;

				default:
					return false;
			}
		}
	}

	ASTType* Clang_AST::createASTType(CXType type, CXCursor src)
	{
		if(type.kind == CXType_Elaborated)
		{
			type = clang_singleStepDesugarType(type);
			// check if it already exists
			auto it = m_typeMap.find(type);
			if(it != m_typeMap.end())
				return it->second;
		}

		// TODO: fix canonical types for CXType_TemplateTypeParm and CXType_TemplateSpecialization
		

		// -------------------------------------------
		
		SelfDisposingCXString kind(clang_getTypeKindSpelling(type.kind));
		ASTType* asttype = new ASTType();

		// check if it already exists
		auto it = m_typeMap.find(type);
		if(it != m_typeMap.end())
			assert(false && "creating already existing type");

		m_typeMap.insert(std::pair<CXType, ASTType*>(type, asttype));

		asttype->setKind(kind.c_str());
		switch(type.kind)
		{
			case CXType_Pointer:
			case CXType_LValueReference:
				{
					auto pointeeType = clang_getPointeeType(type);
					
					// try fix unexposed by using canonical type
					if(pointeeType.kind == CXType_Unexposed)
					{
						ASTType* pointsTo = getASTType(clang_getCanonicalType(pointeeType), src); 
						asttype->setPointsTo(pointsTo);
					}
					else
					{
						ASTType* pointsTo = getASTType(pointeeType, src); 
						asttype->setPointsTo(pointsTo);
					}
					
					break;
				}
			case CXType_Record:
			case CXType_Typedef:
			case CXType_Elaborated:
			case CXType_TemplateTypeParm:
			case CXType_TemplateSpecialization:
				{
					CXCursor typeDecl = clang_getTypeDeclaration(type);
					if(typeDecl.kind != CXCursor_NoDeclFound)
					{
						auto astDecl = getReferencedTreeNodeFromCursor(typeDecl)->getASTObject();
						asttype->setDeclaration(astDecl);
					}
					// TODO: check if we need an assert here: 
					else
					{
						// TODO: put into error-reporter
						printCursorInfo(typeDecl, "ERROR-INFO: No type declaration existing ");
					}
					break;
				}
			case CXType_Unexposed:
				{
					auto location = getSourceLocationFromCursor(src);

					std::stringstream ss;
					ss << "Found unexposed type in " << location.fileName << ":"  << location.line << ":" << location.column;
					m_logger.addWarning(ss.str());
				}
			case CXType_FunctionProto:
				{
					// add parameters
					unsigned numParams = clang_getNumArgTypes(type);
					if(numParams != UINT_MAX)
					{
						for(unsigned i = 0; i < numParams; ++i)
						{
							auto paramType = clang_getArgType(type, i);
							asttype->addParameter(getASTType(paramType, src));
						}
					}
				}
		}

		asttype->setConst(clang_isConstQualifiedType(type) != 0);

		// if we don't have a canonical type already, we'll get it
		auto canonicalType = clang_getCanonicalType(type);
		if(!isBuggyType(type) && !clang_equalTypes(type, canonicalType))
		{
			auto canonicalASTType = getASTType(canonicalType, src);
			asttype->setCanonicalType(canonicalASTType);
		}

		return asttype;
	}

	ASTType* Clang_AST::getASTType(CXType type, CXCursor src)
	{
		auto it = m_typeMap.find(type);

		if(it == m_typeMap.end())
		{
			auto astType = this->createASTType(type, src);
			return astType;
		}
		else
			return it->second;
	}

	void Clang_AST::connectASTObjects(Clang_AST_CXTreeNode& treeNode)
	{
		// if this object is not visible, we skip it
		if(treeNode.getVisibility() == VISIBILITY_NONE)
			return;

		// add ourself to the parent
		ASTObject* astObject = treeNode.getASTObject();
		if(astObject)
		{

			ASTObject* parentASTObject = nullptr;
			auto parentNode = treeNode.getParentNode();
		
			// search the parent ASTObject, some treeNodes may be skipped
			while(true)
			{
				assert(parentNode != nullptr);
				parentASTObject = parentNode->getASTObject();
				if(parentASTObject)
					break;
				else
					parentNode = parentNode->getParentNode();
			}

			if(astObject->getKind() == KIND_PARAMETER)
			{
				auto func = dynamic_cast<ASTObject_Function*>(parentASTObject);
				if(func)
				{
					func->addParameter(static_cast<ASTObject_Parameter*>(astObject));
				}
				else
				{
					// TODO: location
					std::stringstream ss;
					m_logger.addWarning("Parameter parent is not function");
					//assert(func != nullptr);
				}
				
			}
			else
				parentASTObject->addChild(astObject);
		}

		auto& children = treeNode.getChildren();
		for (auto it = children.begin(), end = children.end(); it != end; ++it)
			connectASTObjects(**it);
	}

	void Clang_AST::setBaseInformation(Clang_AST_CXTreeNode& treeNode)
	{
		auto& children = treeNode.getChildren();

		auto subStruct = dynamic_cast<ASTObject_Struct*>(treeNode.getASTObject());
		assert(subStruct != nullptr);

		for(auto it = children.begin(), end = children.end(); it != end; ++it)
		{
			auto baseCursor = (*it)->getCanonicalCursor();
			if(baseCursor.kind == CXCursor_CXXBaseSpecifier)
			{
				auto baseType2 = clang_getCursorType(baseCursor);
				auto baseType = clang_getCanonicalType(baseType2);
				

				if(baseType.kind == CXType_TemplateTypeParm)
				{
					auto location = getSourceLocationFromCursor(baseCursor);
					std::stringstream ss;
					ss << "TemplateTypeParameter as base class is not supported!! in " << location.fileName << ":" << location.line << ":" << location.column;
					m_logger.addWarning(ss.str());
					continue;
				}

				auto baseDecl = clang_getTypeDeclaration(baseType);

				auto baseTreeNode = getReferencedTreeNodeFromCursor(baseDecl);
				assert(baseTreeNode != nullptr);

				auto baseStruct = dynamic_cast<ASTObject_Struct*>(baseTreeNode->getASTObject());
				assert(baseStruct != nullptr);

				auto access = convertClangAccess(clang_getCXXAccessSpecifier(baseCursor));
				subStruct->addBase(baseStruct, access);
			}
		}
	}



}
