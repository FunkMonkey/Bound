#include <clang-c/index.h>
#include <iostream>

#include <string>
#include <map>


#include "ASTCreator.hpp"
#include "ASTObject_Namespace.hpp"
#include "ASTObject_Struct.hpp"

using namespace CPPAnalyzer;

//ASTObject_Namespace* root = new CPPAnalyzer::ASTObject_Namespace(std::string("sdfsdf"));

ASTObject_Namespace* rootASTObject = new ASTObject_Namespace("");

struct CXCursor_less
  {
    bool operator()(CXCursor c1, CXCursor c2) const
    { 
		return	c1.data[0] < c2.data[0] || 
				(c1.data[0] == c2.data[0] && c1.data[1] < c2.data[1]);
    }
  };

typedef std::map<CXCursor, ASTObject*, CXCursor_less> CXCursorASTObjectMap;
CXCursorASTObjectMap astObjects;



CXChildVisitResult printVisitor(CXCursor cursor, CXCursor parent, CXClientData client_data) {

	CXString kindString, displayType, cursorSpelling;

	kindString = clang_getCursorKindSpelling(cursor.kind);
	displayType = clang_getCursorDisplayName(cursor);
	cursorSpelling = clang_getCursorSpelling(cursor);

	CXString pName = clang_getCursorDisplayName(parent);

	ASTObject* parentObject = NULL;
	CXCursorASTObjectMap::iterator it = astObjects.find(parent);
	
	if(it != astObjects.end())
	{
		parentObject = it->second;
		std::cout << "FOUND IT: " << clang_getCString(pName) <<  "\n";
	}

	switch(cursor.kind)
	{
		case CXCursor_Namespace:
		{
			ASTObject_Namespace* astNamespace = ASTCreator::createNamespace(cursor, parentObject);
			parentObject->addChild(astNamespace);
			astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, astNamespace));

			std::cout << "Namespace: " << astNamespace->getNodeName().c_str() << "\n";
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
		
		case CXCursor_ClassDecl:
		{
			printf("%s: %s - %s\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling));
			break;
		}

		case CXCursor_StructDecl:
			{
				CXString structUSR = clang_getCursorUSR(cursor);

				ASTObject_Struct* astStruct = ASTCreator::createStruct(cursor, parentObject);
				parentObject->addChild(astStruct);
				astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, astStruct));
				std::cout << "Struct: " << astStruct->getNodeName().c_str() << ": " << clang_getCString(structUSR) << "\n";
				break;
			}

		case CXCursor_FieldDecl:
			{
				CXType type = clang_getCursorType(cursor);
				printf("%s: %s - %s: %d\n", clang_getCString(kindString), clang_getCString(displayType), clang_getCString(cursorSpelling), type);
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
		case CXCursor_CXXAccessSpecifier:
			{
				// changing access
				enum CX_CXXAccessSpecifier access = clang_getCXXAccessSpecifier(cursor);
				unsigned isVirtual = clang_isVirtualBase(cursor);
				const char *accessStr = 0;

				switch (access) {
				case CX_CXXInvalidAccessSpecifier:
					accessStr = "invalid"; break;
				case CX_CXXPublic:
					accessStr = "public"; break;
				case CX_CXXProtected:
					accessStr = "protected"; break;
				case CX_CXXPrivate:
					accessStr = "private"; break;
						}      

				CXString parentName = clang_getCursorDisplayName(parent);

				printf(" [access=%s parent=%s]\n", accessStr, clang_getCString(parentName));

				break;
			}
		default: break; // shouldn't happen

			// TODO templates
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

int main(int argc, char *argv[]) {

	std::cout << "argc = " << argc << std::endl;
	for(int i = 0; i < argc; i++)
		std::cout << "argv[" << i << "] = " << argv[i] << std::endl; 

	CXIndex Index = clang_createIndex(0, 0);
	CXTranslationUnit TU = clang_parseTranslationUnit(Index, 0,
		argv, argc, 0, 0, CXTranslationUnit_None);

	if(!TU)
	{
		std::cout << "no TU!!";
	}
	else
	{
		std::cout << "starting !!";
		// diagnostics 
		for (unsigned I = 0, N = clang_getNumDiagnostics(TU); I != N; ++I) {
			CXDiagnostic Diag = clang_getDiagnostic(TU, I);
			CXString String = clang_formatDiagnostic(Diag,
				clang_defaultDiagnosticDisplayOptions());
			fprintf(stderr, "%s\n", clang_getCString(String));
			clang_disposeString(String);
		}

		// source-tree
		CXCursor rootCursor = clang_getTranslationUnitCursor(TU);

		astObjects.insert(std::pair<CXCursor, ASTObject*>(rootCursor, rootASTObject));
		clang_visitChildren(rootCursor, printVisitor, NULL);

		// dispose unit
		clang_disposeTranslationUnit(TU);
	}
	
	clang_disposeIndex(Index);

	int foo;
	std::cin >> foo;

	return 0;
}
