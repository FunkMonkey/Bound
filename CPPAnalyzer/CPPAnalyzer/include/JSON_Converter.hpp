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

	/** Represents display options for exporting an AST object
     */
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

	// TODO: remove
	/** Represents the status of a to-be-exported ASTObject
	 *    - used for debugging
     */
	enum ASTObjectStatus
	{
		EXPORTED,
		REFERENCED,
		EXPORTED_AND_REFERENCED
	};

	/** Represents an AST to JSON converter
     */
	class JSON_Converter
	{
		public:
			/** Constructor
			 *
			 * \param   ast   AST to export
			 */
			JSON_Converter(Clang_AST* ast)
				:m_ast(ast)
			{
			}

			/** Converts the AST to JSON and saves the stringified JSON in the given string
			 *
			 * \param   str   String to save JSON in
			 */
			void convertToJSON(std::string& str);
			
			/** Converts the given ASTType to JSON and saves it in the given JSON object
			 *
			 * \param   type      ASTType to convert
			 * \param   jsonObj   JSON Object to save type into
			 *
			 * \return   The JSON object that was passed as the second parameter
			 */
			Json::Value& convertASTTypeToJSON(ASTType& type, Json::Value& jsonObj);

			/** Converts the given ASTObject to JSON and saves it in the given JSON object
			 *
			 * \param   astObject   ASTObject to convert
			 * \param   jsonObj     JSON Object to save type into
			 * \param   options     Export options
			 *
			 * \return   The JSON object that was passed as the second parameter
			 */
			Json::Value& convertASTObjectToJSON(ASTObject& astObject, Json::Value& jsonObj, int options = ADD_ALL);
			

		protected:

			/** Adds the given template info to JSON and saves it in the given JSON object
			 *
			 * \param   templateInfo   Template info to convert
			 * \param   jsonObj        JSON Object to save type into
			 * \param   options        Export options
			 */
			void addTemplateInfo(ASTObjectHelper_Template& templateInfo, Json::Value& objJSON, int options = ADD_ALL);
			
			/** Adds the given ASTObject to the list of exported objects
			 *    - used for debugging
			 *
			 * \param   astObject   ASTObject to add
			 */
			void addASTObjectToExportedList(ASTObject& astObject);

			/** Adds the given ASTObject to the list of referenced objects
			 *    - used for debugging
			 *
			 * \param   astObject   ASTObject to add
			 */
			void addASTObjectToReferencedList(ASTObject& astObject);

			Clang_AST* m_ast;

			std::map<ASTObject*, ASTObjectStatus> m_ASTObjects;
			bool             m_unknownMissingASTObjects;
	};
}

#endif // __JSON_CONVERTER_HPP__