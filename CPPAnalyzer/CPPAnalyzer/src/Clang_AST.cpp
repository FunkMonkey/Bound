
#include "Clang_AST.hpp"


//#include "ASTCreator.hpp"
#include "ASTObject_Namespace.hpp"
#include "ASTObject_Struct.hpp"
#include "ASTObject_Class.hpp"
#include "ASTObject_Field.hpp"

#include <iostream>



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
		CXString displayName = clang_getCursorDisplayName(cursor);

		ASTObject_Namespace* astObject = new ASTObject_Namespace(clang_getCString(displayName));
		astParent->addChild(astObject);
		
		return astObject;
	}

	ASTObject_Struct* Clang_AST::addStruct(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorDisplayName(cursor);

		ASTObject_Struct* astObject = new ASTObject_Struct(clang_getCString(displayName));
		astParent->addChild(astObject);
		
		return astObject;
	}


	ASTObject_Class* Clang_AST::addClass(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorDisplayName(cursor);

		ASTObject_Class* astObject = new ASTObject_Class(clang_getCString(displayName));
		astParent->addChild(astObject);

		return astObject;
	}


	ASTObject_Field* Clang_AST::addField(CXCursor cursor, ASTObject* astParent)
	{
		CXString displayName = clang_getCursorDisplayName(cursor);

		ASTObject_Field* astObject = new ASTObject_Field(clang_getCString(displayName));
		astObject->setAccess(static_cast<ASTObject_Struct*>(astParent)->getCurrentAccess());
		astParent->addChild(astObject);

		//CXCursor returnCursor = clang_getTypeDeclaration(returnType);
		CXType type = clang_getCursorType(cursor);
		CXCursor typeDecl = clang_getTypeDeclaration(type);
		std::cout << "FIELD type: " << clang_getCString(clang_getTypeKindSpelling(type.kind)) << " " << clang_getCString(clang_getCursorDisplayName(typeDecl)) << std::endl;

		// is parameter const???
		/*if(type.kind == CXType_Pointer || type.kind == CXType_LValueReference)
		{
			if(clang_isConstQualifiedType(clang_getPointeeType(type)))
				printf("is const");
		}

		if(clang_isConstQualifiedType(clang_getCursorType(cursor)))
			printf("is const");*/
		
		return astObject;
	}

	std::string Clang_AST::getCursorType(CXCursor cursor)
	{
		return "";
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
					break;
					CXType type = clang_getCursorType(cursor);
					printf("%s: %s - %s: %d\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling), type);
					
					// is parameter const???
					if(type.kind == CXType_Pointer || type.kind == CXType_LValueReference)
					{
						if(clang_isConstQualifiedType(clang_getPointeeType(type)))
							printf("is const");
					}

					if(clang_isConstQualifiedType(clang_getCursorType(cursor)))
						printf("is const");

					
					break;
				}

			//case CXCursor_ClassDecl: PrintCursor(cursor); break;
			// functions
			case CXCursor_FunctionDecl:
				{
					std::cout << "Function: " << clang_getCString(displayType) << ", " << clang_getCString(clang_getCursorUSR(cursor)) << "\n";
					break;
					//printf("%s: %s - %s\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling));
					if (clang_CXXMethod_isStatic(cursor))
						printf(" (static)");
					if (clang_CXXMethod_isVirtual(cursor))
						printf(" (virtual)");

					// return-type
					CXType returnType = clang_getCursorResultType(cursor);
					CXCursor returnCursor = clang_getTypeDeclaration(returnType);	// check CXType, you idiot
					printf("returnType: %s!", clang_getCursorSpelling(returnCursor));

					

					//USR
					//printf("%s\n", clang_getCString(clang_getCursorUSR(cursor))); 
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
		std::string prefix;
		for(int i = 1; i <= depth; ++i)
			prefix += "  ";

		std::cout << prefix << getASTObjectKind(node->getKind()).c_str() << ": " << ((node->getNodeName() != "" ) ? node->getNodeName().c_str() : "anonymous") << std::endl;
		std::vector<ASTObject*>& children = node->getChildren();
		for(int i = 0; i < children.size(); ++i)
		{
			printTreeNode(children[i], depth + 1);
		}
	}

	void Clang_AST::printTree() const
	{
		printTreeNode(m_rootASTObject, 0);
	}



}


