
#include "Clang_AST.hpp"

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
	std::string CXStringToStdStringAndFree(CXString cxString)
	{
		std::string result(clang_getCString(cxString));
		clang_disposeString(cxString);
		return result;
	}

	ASTObject_SourceLocation getSourceLocation(CXCursor cursor)
	{
		auto cursorLocation = clang_getCursorLocation(cursor);
		auto cursorRange = clang_getCursorExtent(cursor);

		CXFile file;
		unsigned line, column, offset;
		clang_getExpansionLocation(cursorLocation, &file, &line, &column, &offset);

		ASTObject_SourceLocation location;

		if(file)
		{
			location.fileName = CXStringToStdStringAndFree(clang_getFileName(file));
		}

		// TODO: etc

		return location;
		
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
	}


	Clang_AST::Clang_AST(CXCursor translationUnit)
	: m_rootCursor(translationUnit)
	{
		m_rootASTObject = new ASTObject_Namespace("");
		m_astObjects.insert(std::pair<CXCursor, ASTObject*>(m_rootCursor, m_rootASTObject));

		//m_usrASTObjects.insert(std::pair<CXCursor, ASTObject*>(m_rootCursor, m_rootASTObject));
	}

	ASTObject_Namespace* Clang_AST::addNamespace(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Namespace* astObject = new ASTObject_Namespace(displayName.c_str());
		astParent->addChild(astObject);
		astObject->setUSR(USR.c_str());
		
		return astObject;
	}

	ASTObject_Struct* Clang_AST::addStruct(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Struct* astObject = new ASTObject_Struct(displayName.c_str());
		astParent->addChild(astObject);
		astObject->setUSR(USR.c_str());
		
		return astObject;
	}


	ASTObject_Class* Clang_AST::addClass(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Class* astObject = new ASTObject_Class(displayName.c_str());
		astParent->addChild(astObject);
		astObject->setUSR(USR.c_str());

		return astObject;
	}


	ASTObject_Field* Clang_AST::addField(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Field* astObject = new ASTObject_Field(displayName.c_str());
		astParent->addChild(astObject);
		astObject->setUSR(USR.c_str());

		// Field properties
		astObject->setAccess(static_cast<ASTObject_Struct*>(astParent)->getCurrentAccess());
		astObject->setType(createASTTypeFromCursor(cursor, false));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true));
		
		return astObject;
	}

	ASTObject_Function* Clang_AST::addFunction(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Function* astObject = new ASTObject_Function(displayName.c_str());
		astParent->addChild(astObject);
		astObject->setUSR(USR.c_str());

		// Function properties
		CXType returnType = clang_getCursorResultType(cursor);
		astObject->setReturnType(createASTType(returnType, false));
		astObject->setReturnTypeCanonical(createASTType(returnType, true));

		return astObject;
	}

	ASTObject_Member_Function* Clang_AST::addMemberFunction(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Member_Function* astObject = new ASTObject_Member_Function(displayName.c_str());
		astParent->addChild(astObject);	
		astObject->setUSR(USR.c_str());

		// Member function properties
		CXType returnType = clang_getCursorResultType(cursor);

		// TODO: check if parent is struct or class
		astObject->setAccess(static_cast<ASTObject_Struct*>(astParent)->getCurrentAccess());
		astObject->setReturnType(createASTType(returnType, false));
		astObject->setReturnTypeCanonical(createASTType(returnType, true));
		astObject->setVirtual(clang_CXXMethod_isVirtual(cursor));
		astObject->setStatic(clang_CXXMethod_isStatic(cursor));

		return astObject;
	}

	ASTObject_Constructor* Clang_AST::addConstructor(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Constructor* astObject = new ASTObject_Constructor(displayName.c_str());
		astObject->setUSR(USR.c_str());
		
		// Constructor properties
		// TODO: check if parent is struct or class, throw exception
		ASTObject_Struct* parentStruct = static_cast<ASTObject_Struct*>(astParent);
		astObject->setAccess(parentStruct->getCurrentAccess());
		parentStruct->addConstructor(astObject);
		
		return astObject;
	}

	ASTObject_Destructor* Clang_AST::addDestructor(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Destructor* astObject = new ASTObject_Destructor(displayName.c_str());
		astObject->setUSR(USR.c_str());
		
		// Destructor properties
		// TODO: check if parent is struct or class, throw exception
		ASTObject_Struct* parentStruct = static_cast<ASTObject_Struct*>(astParent);
		astObject->setAccess(parentStruct->getCurrentAccess());
		parentStruct->setDestructor(astObject);

		return astObject;
	}

	// TODO: differ between declarations and definitions, otherwise multiple params
	ASTObject_Parameter* Clang_AST::addParameter(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Parameter* astObject = new ASTObject_Parameter(displayName.c_str());
		astObject->setUSR(USR.c_str());
		
		// Parameter properties
		astObject->setType(createASTTypeFromCursor(cursor, false));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true));

		ASTObject_Function* parentFunc = dynamic_cast<ASTObject_Function*>(astParent);
		if(parentFunc)
			parentFunc->addParameter(astObject);

		// TODO: else throw exception

		return astObject;
	}

	ASTObject_Typedef* Clang_AST::addTypedef(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString displayName(clang_getCursorSpelling(cursor));
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));

		ASTObject_Typedef* astObject = new ASTObject_Typedef(displayName.c_str());
		astParent->addChild(astObject);	
		astObject->setUSR(USR.c_str());

		// Typedef properties
		CXType type = clang_getTypedefDeclUnderlyingType(cursor);
		
		astObject->setType(createASTType(type, false));
		astObject->setTypeCanonical(createASTType(type, true));

		// TODO: else throw exception

		return astObject;
	}

	void Clang_AST::addBase(CXCursor cursor, ASTObject* astParent)
	{
		ASTObject* baseObject = getTypeDeclaration(cursor, true);
		// TODO: check if struct or class

		ASTObject_Struct* parentStruct = dynamic_cast<ASTObject_Struct*>(astParent);
		if(parentStruct)
		{
			

			enum CX_CXXAccessSpecifier access = clang_getCXXAccessSpecifier(cursor);

			ASTObjectAccess astAccess;

			switch (access) {
				case CX_CXXPublic:    astAccess = ACCESS_PUBLIC; break;
				case CX_CXXProtected: astAccess = ACCESS_PROTECTED; break;
				case CX_CXXPrivate:   astAccess = ACCESS_PRIVATE; break;
				default: break; // TODO: error
			}

			parentStruct->addBase(static_cast<ASTObject_Struct*>(baseObject), astAccess);
		}
		// TODO: else throw exception

	}

	ASTObject* Clang_AST::getTypeDeclaration(CXCursor cursor, bool canonical)
	{
		CXType inputType = clang_getCursorType(cursor);
		CXType type = (canonical) ? clang_getCanonicalType(inputType): inputType;

		CXCursor typeDecl = clang_getTypeDeclaration(type);
		auto it = m_astObjects.find(typeDecl);
		if(it != m_astObjects.end())
			return it->second;

		return NULL;
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

		SelfDisposingCXString kind(clang_getTypeKindSpelling(type.kind));

		ASTType* asttype = new ASTType();
		asttype->setKind(kind.c_str());
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
			case CXType_Typedef:
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
		SelfDisposingCXString kindSpelling(clang_getCursorKindSpelling(cursor.kind));
		SelfDisposingCXString displayName(clang_getCursorDisplayName(cursor));
		SelfDisposingCXString cursorSpelling(clang_getCursorSpelling(cursor));
		SelfDisposingCXString usr(clang_getCursorUSR(cursor));

		std::string usr_string(usr.c_str());

		// check for multiple declarations

		
		// TODO: use clang_getCanonicalCursor
		//auto itUSR = m_usrASTObjects.find(usr_string);
		//if(itUSR != m_usrASTObjects.end())
		//{
		//	// use the same ASTObject*
		//	m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, itUSR->second));
		//	return CXChildVisit_Recurse;
		//}

		auto canonicalCursor = clang_getCanonicalCursor(cursor);
		auto itCanonicalCursor = m_canonicalASTObjects.find(canonicalCursor);
		if(itCanonicalCursor != m_canonicalASTObjects.end())
		{
			auto existingASTObject = itCanonicalCursor->second;

			// use the same ASTObject*
			m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, existingASTObject));

			auto location = getSourceLocation(cursor);

			if(clang_isCursorDefinition(cursor))
				existingASTObject->setDefinition(location);
			else
				existingASTObject->addDeclaration(location);


			return CXChildVisit_Recurse;
		}

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

			case CXCursor_TypedefDecl:
			{
				astObject = addTypedef(cursor, astParent);
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

			case CXCursor_Constructor:
			{
				astObject = addConstructor(cursor, astParent);
				break;
			}

			case CXCursor_Destructor:
			{
				astObject = addDestructor(cursor, astParent);
				break;
			}

			case CXCursor_CXXBaseSpecifier:
			{
				addBase(cursor, astParent);
				break;
			}

			// changing the access
			case CXCursor_CXXAccessSpecifier:
			{
				std::cout << "ACCESS" << "\n";

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
			
			// parameters
			case CXCursor_ParmDecl: 
			{
				// fix: parameters for multiple declarations
				// TODO: put somewhere else
				CXType funcType = clang_getCursorType(parent);
				int numArgs = clang_getNumArgTypes(funcType);

				if(static_cast<ASTObject_Function*>(astParent)->getParameters().size() < numArgs)
					astObject = addParameter(cursor, astParent);
				break;
			}

			// functions
			case CXCursor_FunctionDecl:
			{
				astObject = addFunction(cursor, astParent);
				break;
			}
			
			default: 
				std::cout << "UNHANDLED: " << kindSpelling.c_str() << " " << displayName.c_str() << "\n";
				break; // shouldn't happen

				// TODO templates
		}
		
		if(astObject)
		{
			m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, astObject));
			
			//if(usr_string != "")
			//	m_usrASTObjects.insert(std::pair<std::string, ASTObject*>(usr_string, astObject));

			auto location = getSourceLocation(cursor);

			if(clang_isCursorDefinition(cursor))
				astObject->setDefinition(location);
			else
				astObject->addDeclaration(location);

			m_canonicalASTObjects.insert(std::pair<CXCursor, ASTObject*>(canonicalCursor, astObject));

			//std::cout << getASTObjectKind(astObject->getKind()).c_str() << " " << astObject->getNodeName().c_str() << "\n";
		}
		
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
		auto& children = node->getChildren();

		auto end = children.end();
		for(auto it = children.begin(); it != end; ++it)
		{
			printTreeNode(*it, depth + 1);
		}
	}

	void Clang_AST::printTree() const
	{
		printTreeNode(m_rootASTObject, 0);
	}



}


