#ifndef __CLANG_HELPERS_HPP__
#define __CLANG_HELPERS_HPP__

#include <clang-c/index.h>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	/** Returns the source code location from the given cursor
	 *
	 * \param   cursor   Cursor to get location for
	 *
	 * \return   Source code location
	 */
	ASTObject_SourceLocation getSourceLocationFromCursor(CXCursor cursor);
	
}

#endif // __CLANG_HELPERS_HPP__