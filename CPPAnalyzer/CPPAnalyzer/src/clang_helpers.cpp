#include "clang_helpers.hpp"
#include "SelfDisposingCXString.hpp"


CPPAnalyzer::ASTObject_SourceLocation CPPAnalyzer::getSourceLocationFromCursor(CXCursor cursor)
{
	{
		auto cursorLocation = clang_getCursorLocation(cursor);
		auto cursorRange = clang_getCursorExtent(cursor);

		CXFile file;
		unsigned line, column, offset;
		clang_getExpansionLocation(cursorLocation, &file, &line, &column, &offset);

		ASTObject_SourceLocation location;

		if(file)
		{
			location.fileName = SelfDisposingCXString(clang_getFileName(file)).c_str();
			location.line = line;
			location.column = column;
		}

		// TODO: etc

		return location;
	}
}

