
#include "Clang_AST.hpp"

//#include "ASTCreator.hpp"
#include "ASTObject_Namespace.hpp"
#include "ASTObject_Struct.hpp"
#include "ASTObject_Class.hpp"
#include "ASTObject_Field.hpp"
#include "ASTObject_Function.hpp"
#include "ASTObject_Member_Function.hpp"

#include <iostream>

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
	Clang_AST::Clang_AST(CXCursor translationUnit)
	: m_rootCursor(translationUnit)
	{
		m_rootASTObject = new ASTObject_Namespace("");
		m_astObjects.insert(std::pair<CXCursor, ASTObject*>(m_rootCursor, m_rootASTObject));

		//m_usrASTObjects.insert(std::pair<CXCursor, ASTObject*>(m_rootCursor, m_rootASTObject));
	}

	ASTObject_Namespace* Clang_AST::addNamespace(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorSpelling(cursor);

		ASTObject_Namespace* astObject = new ASTObject_Namespace(clang_getCString(displayName));
		astParent->addChild(astObject);
		
		return astObject;
	}

	ASTObject_Struct* Clang_AST::addStruct(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorSpelling(cursor);

		ASTObject_Struct* astObject = new ASTObject_Struct(clang_getCString(displayName));
		astParent->addChild(astObject);
		
		return astObject;
	}


	ASTObject_Class* Clang_AST::addClass(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorSpelling(cursor);

		ASTObject_Class* astObject = new ASTObject_Class(clang_getCString(displayName));
		astParent->addChild(astObject);

		return astObject;
	}


	ASTObject_Field* Clang_AST::addField(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorSpelling(cursor);

		ASTObject_Field* astObject = new ASTObject_Field(clang_getCString(displayName));
		astObject->setAccess(static_cast<ASTObject_Struct*>(astParent)->getCurrentAccess());

		astObject->setType(createASTTypeFromCursor(cursor, false));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true));

		// TODO: use add field
		astParent->addChild(astObject);
		
		return astObject;
	}

	ASTObject_Function* Clang_AST::addFunction(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorSpelling(cursor);

		ASTObject_Function* astObject = new ASTObject_Function(clang_getCString(displayName));

		CXType returnType = clang_getCursorResultType(cursor);

		astObject->setReturnType(createASTType(returnType, false));
		astObject->setReturnTypeCanonical(createASTType(returnType, true));

		astParent->addChild(astObject);
		
		return astObject;
	}

	ASTObject_Member_Function* Clang_AST::addMemberFunction(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorSpelling(cursor);

		ASTObject_Member_Function* astObject = new ASTObject_Member_Function(clang_getCString(displayName));

		CXType returnType = clang_getCursorResultType(cursor);

		astObject->setAccess(static_cast<ASTObject_Struct*>(astParent)->getCurrentAccess());
		astObject->setReturnType(createASTType(returnType, false));
		astObject->setReturnTypeCanonical(createASTType(returnType, true));
		astObject->setVirtual(clang_CXXMethod_isVirtual(cursor));

		// TODO: is static

		// TODO: use addFunction
		astParent->addChild(astObject);
		
		return astObject;
	}

	ASTObject_Variable_Decl* Clang_AST::addParameter(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorSpelling(cursor);

		ASTObject_Variable_Decl* astObject = new ASTObject_Variable_Decl(clang_getCString(displayName));
		
		astObject->setType(createASTTypeFromCursor(cursor, false));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true));

		ASTObjectKind kind = astParent->getKind();
		if(kind == KIND_FUNCTION || kind == KIND_MEMBER_FUNCTION)
		{
			static_cast<ASTObject_Function*>(astParent)->addParameter(astObject);
		}
		// TODO: else throw exception
		
		return astObject;
	}

	ASTType* Clang_AST::createASTTypeFromCursor(CXCursor cursor, bool canonical)
	{
		CXType type = clang_getCursorType(cursor);
		return createASTType(type, canonical);
	}

	ASTType* Clang_AST::createASTType(CXType inputType, bool canonical)
	{
		// do we use the canonical type or not?
		CXType type = (canonical) ? clang_getCanonicalType(inputType): inputType;

		ASTType* asttype = new ASTType();
		asttype->setKind(clang_getCString(clang_getTypeKindSpelling(type.kind)));
		switch(type.kind)
		{
			case CXType_Pointer:
			case CXType_LValueReference:
				{
					ASTType* pointsTo = createASTType(clang_getPointeeType(type)); 
					asttype->setPointsTo(pointsTo);
					break;
				}
			case CXType_Record:
				{
					CXCursor typeDecl = clang_getTypeDeclaration(type);
					CXCursorASTObjectMap::iterator it = m_astObjects.find(typeDecl);
					if(it != m_astObjects.end())
						asttype->setDeclaration(it->second);
					break;
				}
		}

		asttype->setConst(clang_isConstQualifiedType(type));

		return asttype;
	}

	/** 
	 *
	 * \param 	cursor 
	 * \param 	parent 
	 * \param 	client_data 
	 * \return	
	 */
	CXChildVisitResult Clang_AST::visitCursor(CXCursor cursor, CXCursor parent, CXClientData client_data)
	{
		CXString kindString, displayType, cursorSpelling;

		kindString = clang_getCursorKindSpelling(cursor.kind);
		displayType = clang_getCursorDisplayName(cursor);
		cursorSpelling = clang_getCursorSpelling(cursor);

		std::string usr_string = std::string(clang_getCString(clang_getCursorUSR(cursor)));

		// check for multiple declarations
		// TODO: use clang_getCanonicalCursor
		std::map<std::string, ASTObject*>::iterator itUSR = m_usrASTObjects.find(usr_string);
		if(itUSR != m_usrASTObjects.end())
		{
			// use the same ASTObject*
			m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, itUSR->second));
			return CXChildVisit_Recurse;
		}

		//std::cout << clang_getCString(kindString) << " " << clang_getCString(displayType) << " " << usr_string.c_str() << std::endl;

		// get the parent ASTObject*
		ASTObject* astParent = NULL;
		CXCursorASTObjectMap::iterator it = m_astObjects.find(parent);
		if(it != m_astObjects.end())
			astParent = it->second;

		ASTObject* astObject = NULL;
		// differ between the cursors
		switch(cursor.kind)
		{
			case CXCursor_Namespace:
			{
				astObject = addNamespace(cursor, astParent);
				break;
			}

			case CXCursor_StructDecl:
			{
				astObject = addStruct(cursor, astParent);
				break;
			}

			case CXCursor_ClassDecl:
			{
				astObject = addClass(cursor, astParent);
				break;
			}

			// changing the access
			case CXCursor_CXXAccessSpecifier:
				{
					enum CX_CXXAccessSpecifier access = clang_getCXXAccessSpecifier(cursor);

					switch (access) {
						case CX_CXXPublic:    static_cast<ASTObject_Struct*>(astParent)->setCurrentAccess(ACCESS_PUBLIC); break;
						case CX_CXXProtected: static_cast<ASTObject_Struct*>(astParent)->setCurrentAccess(ACCESS_PROTECTED); break;
						case CX_CXXPrivate:   static_cast<ASTObject_Struct*>(astParent)->setCurrentAccess(ACCESS_PRIVATE); break;
						default: break; // TODO: error
					}      

					break;
				}

			case CXCursor_CXXMethod:
			{
				astObject = addMemberFunction(cursor, astParent);
				break;
			}

			case CXCursor_FieldDecl:
				{
					astObject = addField(cursor, astParent);
					break;
				}

			case CXCursor_NamespaceAlias:
				{
					printf("%s: %s - %s\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling));
					break;
				}

			case CXCursor_NamespaceRef:
				{
					printf("%s: %s - %s\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling));
					break;
				}
			
			// parameters
			case CXCursor_ParmDecl: 
				{
					astObject = addParameter(cursor, astParent);
					break;
				}

			//case CXCursor_ClassDecl: PrintCursor(cursor); break;
			// functions
			case CXCursor_FunctionDecl:
				{
					astObject = addFunction(cursor, astParent);
					break;
				}
			case CXCursor_OverloadedDeclRef:
				{
					unsigned N = clang_getNumOverloadedDecls(cursor);
					printf("overloads: %d", N);
					break;
				}
			
			default: break; // shouldn't happen

				// TODO templates
		}
		
		if(astObject)
		{
			m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, astObject));
			if(usr_string != "")
				m_usrASTObjects.insert(std::pair<std::string, ASTObject*>(usr_string, astObject));

			std::cout << getASTObjectKind(astObject->getKind()).c_str() << " " << astObject->getNodeName().c_str() << "\n";
		}
		

		//

		// ranges ...
		/*CXSourceRange range = clang_getCursorExtent(cursor);
		CXSourceLocation startLocation = clang_getRangeStart(range);
		CXSourceLocation endLocation = clang_getRangeEnd(range);

		CXFile file;
		unsigned int line, column, offset;
		clang_getInstantiationLocation(startLocation, &file, &line, &column, &offset);
		printf("Start: Line: %u Column: %u Offset: %u\n", line, column, offset);
		clang_getInstantiationLocation(endLocation, &file, &line, &column, &offset);
		printf("End: Line: %u Column: %u Offset: %u\n", line, column, offset);*/

		return CXChildVisit_Recurse;
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
		vector<ASTObject*>& children = node->getChildren();

		vector<ASTObject*>::iterator end = children.end();
		for(vector<ASTObject*>::iterator it = children.begin(); it != end; ++it)
		{
			printTreeNode(*it, depth + 1);
		}
	}

	void Clang_AST::printTree() const
	{
		printTreeNode(m_rootASTObject, 0);
	}



}


