#ifndef WRAP_HELPERS_EXCEPTIONS_HPP
#define WRAP_HELPERS_EXCEPTIONS_HPP

#include <exception>

// macros for converting C++ exceptions to JS exceptions
#define JSWRAP_TRY_START try{
#define JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, funcName)	} \
														catch(std::exception& e) { \
															JS_ReportError(cx, e.what()); \
															return false; \
														}

namespace jswrap
{
	/** 
	 * Represents an exception for the JS wrapping
	 */
	class exception: public std::exception
	{
		public:
		exception(const char* text)
			:std::exception(text)
		{

		}
	};

	class PendingException: public std::exception
		{
		public:
			PendingException(const char* text)
				:std::exception(text)
			{

			}
	};
}

#endif // WRAP_HELPERS_EXCEPTIONS_HPP