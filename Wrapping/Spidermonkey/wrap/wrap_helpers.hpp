#ifndef WRAP_HELPERS_HPP
#define WRAP_HELPERS_HPP

#define JSWRAP_TRY_START try{
#define JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx)	} \
												catch(std::exception& e) { \
													JS_ReportError(cx, e.what()); \
													return false; \
												}

#endif // WRAP_HELPERS_HPP