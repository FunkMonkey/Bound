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

struct ParserInfo
{
	char* astTreeJSON;
};


extern "C"
{
	LIBRARY_API void free_ParserInfo(ParserInfo* pi);

	LIBRARY_API ParserInfo* parse_header(int argc, char *argv[], const char* filterFile, const char* filterName, int filterAccess);
}

#endif // __CLANG_JSON_LIB_HPP__