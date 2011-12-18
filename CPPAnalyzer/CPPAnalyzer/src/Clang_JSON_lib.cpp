
#include "Clang_JSON_lib.hpp"

#include <clang-c/index.h>
#include <iostream>

#include <string>


#include "Clang_AST.hpp"
#include "JSON_Converter.hpp"

using namespace CPPAnalyzer;

	Clang_AST* clang_AST = NULL;

	CXChildVisitResult printVisitor(CXCursor cursor, CXCursor parent, CXClientData client_data)
	{

		return clang_AST->visitCursor(cursor, parent, client_data);
		
	}

	void free_ParserInfo(ParserInfo* pi)
	{
		delete[] (pi->astTreeJSON);
		pi->astTreeJSON = NULL;
	}

	ParserInfo* parse_header(int argc, char *argv[])
	{
		ParserInfo* parserInfo = NULL;
		
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
			clang_AST = new Clang_AST(rootCursor);

			clang_visitChildren(rootCursor, printVisitor, NULL);

			std::cout << "---------------" << std::endl;
			clang_AST->printTree();
			std::cout << "---------------" << std::endl;
			
			std::string json;
			JSON_Converter json_conv(clang_AST);
			json_conv.convertToJSON(json);

			// all that copying, TODO: performance
			parserInfo = new ParserInfo();
			parserInfo->astTreeJSON = new char[json.size() + 1];
			std::copy(json.begin(), json.end(), parserInfo->astTreeJSON);
			parserInfo->astTreeJSON[json.size()] = '\0';

			
			//std::cout << json.c_str();


			// dispose unit
			clang_disposeTranslationUnit(TU);
		}
		
		clang_disposeIndex(Index);

		return parserInfo;
	}