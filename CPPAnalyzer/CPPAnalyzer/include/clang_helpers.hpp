#ifndef __CLANG_HELPERS_HPP__
#define __CLANG_HELPERS_HPP__

#include <clang-c/index.h>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	ASTObject_SourceLocation getSourceLocationFromCursor(CXCursor cursor);
	
}

#endif // __CLANG_HELPERS_HPP__