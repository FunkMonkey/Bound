#include "Functions_Strings_wrap.hpp"
#include "Functions_Strings.hpp"

#include "wrap_helpers/wrap_helpers_x.hpp"
#include "wrap_helpers/char_string_x.hpp"
#include "wrap_helpers/std_string_x.hpp"

namespace jswrap
{
	namespace Functions_Strings
	{
		//---------------------------------------------------
		// VOID FUNCTION, 1 PARAMETER
		//---------------------------------------------------


		//     void_param0_constCharPtr
		JSBool void_param0_constCharPtr_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				const char* x = jsval_to_char_array_x(cx, args[0]);
				void_param0_constCharPtr(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param0_constCharPtr")

			return true;
		}

		//     void_param0_stdString
		JSBool void_param0_stdString_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				std::string x = jsval_to_stdString_x(cx, args[0]);
				void_param0_stdString(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param0_stdString")

			return true;
		}

		//     void_param0_constStdStringRef
		JSBool void_param0_constStdStringRef_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				const std::string& x = jsval_to_stdString_x(cx, args[0]);
				void_param0_constStdStringRef(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param0_constStdStringRef")

			return true;
		}

		//---------------------------------------------------
		// RETURN VALUE, NO PARAMETER
		//---------------------------------------------------

		//     constCharPtr_param0
		JSBool constCharPtr_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				const char* cppResult = constCharPtr_param0();

				nullterminated_char_array_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "constCharPtr_param0")

			return true;
		}

		//     stdString_param0
		JSBool stdString_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				std::string cppResult = stdString_param0();

				stdString_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "stdString_param0")

			return true;
		}
		
		//     constStdStringRef_param0
		JSBool constStdStringRef_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				const std::string& cppResult = constStdStringRef_param0();

				stdString_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "constStdStringRef_param0")

			return true;
		}

		//     constStdStringPtr_param0
		JSBool constStdStringPtr_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				const std::string* cppResult = constStdStringPtr_param0();

				stdString_to_jsval_x(cx, *cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "constStdStringPtr_param0")

			return true;
		}

		//---------------------------------------------------
		// Exposing the functionality
		//---------------------------------------------------
		JSBool init(JSContext* cx, JSObject* scope)
		{
			JSFunctionSpec functions[] = {

				// VOID FUNCTION, 1 PARAMETER
				JS_FS("void_param0_constCharPtr",            void_param0_constCharPtr_wrap,             1, 0),
				JS_FS("void_param0_stdString",               void_param0_stdString_wrap,                1, 0),
				JS_FS("void_param0_constStdStringRef",       void_param0_constStdStringRef_wrap,        1, 0),

				// RETURN VALUE, NO PARAMETER
				JS_FS("constCharPtr_param0",                 constCharPtr_param0_wrap,                  0, 0),
				JS_FS("stdString_param0",                    stdString_param0_wrap,                     0, 0),
				JS_FS("constStdStringRef_param0",            constStdStringRef_param0_wrap,             0, 0),
				JS_FS("constStdStringPtr_param0",            constStdStringPtr_param0_wrap,             0, 0),

				JS_FS_END
			};

			if(!JS_DefineFunctions(cx, scope, functions))
				return false;

			return true;
		}
	}
}