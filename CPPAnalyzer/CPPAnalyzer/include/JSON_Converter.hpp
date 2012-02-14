#ifndef __JSON_CONVERTER_HPP__
#define __JSON_CONVERTER_HPP__

// no forward declarations
#include <string>
#include <map>

namespace Json{
	class Value;
}

namespace CPPAnalyzer
{
	class Clang_AST;
	class ASTObject;
	class ASTType;
	class ASTObjectHelper_Template;

	enum ASTObject_Options
	{
		ADD_NAME         = 1,
		ADD_DISPLAYNAME  = 2,
		ADD_USR          = 4,
		ADD_KIND         = 8,
		ADD_ID           = 16,
		ADD_ISDEFINITION = 32,
		ADD_DEFINITION   = 64,
		ADD_DECLARATIONS = 128,

		ADD_ALL = ADD_NAME | ADD_DISPLAYNAME | ADD_USR | ADD_KIND | ADD_ID | ADD_ISDEFINITION | ADD_DEFINITION | ADD_DECLARATIONS
	};

	enum ASTObjectStatus
	{
		EXPORTED,
		REFERENCED,
		EXPORTED_AND_REFERENCED
	};

	class JSON_Converter
	{
		public:
			JSON_Converter(Clang_AST* ast)
				:m_ast(ast)
			{
			}

			
			
			void addTemplateInfo(ASTObjectHelper_Template& templateInfo, Json::Value& objJSON, int options = ADD_ALL);
			Json::Value& convertASTTypeToJSON(ASTType& type, Json::Value& jsonObj);
			Json::Value& convertASTObjectToJSON(ASTObject& astObject, Json::Value& jsonObj, int options = ADD_ALL);
			void convertToJSON(std::string& str);

			void addASTObjectToExportedList(ASTObject& astObject);
			void addASTObjectToReferencedList(ASTObject& astObject);

		protected:
			Clang_AST* m_ast;


			std::map<ASTObject*, ASTObjectStatus> m_ASTObjects;
			bool             m_unknownMissingASTObjects;

			
	};
}

#endif // __JSON_CONVERTER_HPP__