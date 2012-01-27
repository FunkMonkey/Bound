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
				:m_ast(ast)
			{
			}
			
			void convertToJSON(std::string& str);

		protected:

			Clang_AST* m_ast;
	};
}

#endif // __JSON_CONVERTER_HPP__