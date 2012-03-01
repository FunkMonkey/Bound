#ifndef __CLANG_JSON_LIB_HPP__
#define __CLANG_JSON_LIB_HPP__


#ifdef _WIN32
#    ifdef LIBRARY_EXPORTS
#        define LIBRARY_API __declspec(dllexport)
#    else
#        define LIBRARY_API __declspec(dllimport)
#    endif
#else
#    define LIBRARY_API
#endif

#include <string>

/** Represents the result of a parsing operation
 */
struct ParserInfo
{
	char* astTreeJSON;
};


extern "C"
{
	/** Frees the given parser info
	 *
	 * \param   pi   Parser information to free
	 */
	LIBRARY_API void free_ParserInfo(ParserInfo* pi);


	/** Parses a header file and returns the filtered AST as JSON
	 *
	 * \param   argc           Number of arguments passed to Clang
	 * \param   argv           Command-line arguments passed to Clang
	 * \param   filterFile     Filename used for filtering
	 * \param   filterName     String used for symbol name filtering
	 * \param   filterAccess   Access filter
	 *
	 * \return   Parser information with AST in JSON
	 */
	LIBRARY_API ParserInfo* parse_header(int argc, char *argv[], const char* filterFile, const char* filterName, int filterAccess);
}

#endif // __CLANG_JSON_LIB_HPP__