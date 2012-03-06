
#include "Clang_JSON_lib.hpp"

#include <clang-c/index.h>
#include <iostream>

#include <string>


#include "Clang_AST.hpp"
#include "JSON_Converter.hpp"

// temp
#include "SelfDisposingCXString.hpp"

using namespace CPPAnalyzer;

	void free_ParserInfo(ParserInfo* pi)
	{
		delete[] (pi->astTreeJSON);
		pi->astTreeJSON = NULL;
	}

	CXChildVisitResult temp_printVisitor(CXCursor cursor, CXCursor parent, CXClientData client_data)
	{
		std::cout << SelfDisposingCXString(clang_getCursorKindSpelling(cursor.kind)).c_str() << ": " << SelfDisposingCXString(clang_getCursorSpelling(cursor)).c_str() << "---- (" << SelfDisposingCXString(clang_getCursorSpelling(parent)).c_str() << ")"  << "\n";
		return CXChildVisit_Recurse;
	}

	ParserInfo* parse_header(int argc, char *argv[], const char* filterFile, const char* filterName, int filterAccess)
	{
		ParserInfo* parserInfo = NULL;

		Clang_AST clang_AST;

		auto& logger = clang_AST.getLogger();

		// TODO: move everything into Clang_AST, except for the export
		
		std::cout << "argc = " << argc << std::endl;
		for(int i = 0; i < argc; i++)
			std::cout << "argv[" << i << "] = " << argv[i] << std::endl; 

		CXIndex Index = clang_createIndex(0, 0);
		CXTranslationUnit TU = clang_parseTranslationUnit(Index, 0,
			argv, argc, 0, 0, CXTranslationUnit_None);

		if(!TU)
		{
			logger.addError("Fatal: Could not create Translation Unit!");
		}
		else
		{
			//clang_visitChildren(clang_getTranslationUnitCursor(TU), temp_printVisitor, nullptr);
			try
			{
				// setting the filter
				VisibilityFilter filter(filterFile, filterName, (Filter_Access)filterAccess);
				clang_AST.setFilter(filter); // TODO: safety!

				// source-tree
				clang_AST.setTranslationUnit(TU);
			}
			catch(std::regex_error)
			{
				logger.addError("Fatal: Malformed regular expression for filter!");
			}

			
			// dispose unit
			clang_disposeTranslationUnit(TU);
		}

		std::cout << "---------------" << std::endl;
		
		auto& messages = logger.getMessages();
		for(auto it = messages.begin(), end = messages.end(); it != end; ++it)
			std::cout << (*it).message << std::endl;

		std::cout << "---------------" << std::endl;
		clang_AST.printTree();
		std::cout << "---------------" << std::endl;

		std::string json;
		JSON_Converter json_conv(&clang_AST);
		json_conv.convertToJSON(json);

		// all that copying, TODO: performance
		parserInfo = new ParserInfo();
		parserInfo->astTreeJSON = new char[json.size() + 1];
		std::copy(json.begin(), json.end(), parserInfo->astTreeJSON);
		parserInfo->astTreeJSON[json.size()] = '\0';

		std::cout << json.c_str();

		clang_disposeIndex(Index);

		return parserInfo;
	}
