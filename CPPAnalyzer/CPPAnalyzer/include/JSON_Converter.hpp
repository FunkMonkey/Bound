#ifndef __JSON_CONVERTER_HPP__
#define __JSON_CONVERTER_HPP__

// no forward declarations
#include <string>
#include <sstream>

namespace CPPAnalyzer
{
	class Clang_AST;
	class ASTObject;
	class ASTType;

	class JSON_Converter
	{
		public:
			JSON_Converter(Clang_AST* ast)
				:m_ast(ast), m_lineBreak("\n"), m_indent("  ")
			{
			}
			
			void convertAllChildrenToJSON(ASTObject& astObject, std::stringstream& ss, int depth);
			void convertToJSON(ASTType& type, std::stringstream& ss, int depth);
			bool convertToJSON(ASTObject& astObject, std::stringstream& ss, int depth);
			void convertToJSON(std::string& str);

		protected:
			void addProperty(const std::string& propName, const std::string& value, std::stringstream& ss, const std::string& indent, bool isLast = false);
			void addProperty(const std::string& propName, const char* value, std::stringstream& ss, const std::string& indent, bool isLast = false);
			void addProperty(const std::string& propName, unsigned int value, std::stringstream& ss, const std::string& indent, bool isLast = false);
			void addProperty(const std::string& propName, float value, std::stringstream& ss, const std::string& indent, bool isLast = false);
			void addProperty(const std::string& propName, bool value, std::stringstream& ss, const std::string& indent, bool isLast = false);
			void addLine(const std::string& line, std::stringstream& ss, const std::string& indent);

			void addCommonProps(ASTObject& astObject, std::stringstream& ss, std::string& indent);

			Clang_AST* m_ast;
			std::string m_lineBreak;
			std::string m_indent;
	};
}

#endif // __JSON_CONVERTER_HPP__