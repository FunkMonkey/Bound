#include "GlobalFunctions.hpp"

#include "../wrap_helpers/wrap_helpers_x.hpp"
#include "../wrap_helpers/char_string_x.hpp"
#include "../wrap_helpers/std_string_x.hpp"

#include <iostream>

namespace jswrap
{
	namespace GlobalFunctions
	{
		JSBool print_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				const std::string& x = jsval_to_stdString_convert_x(cx, args[0]);
				std::cout << x.c_str() << std::endl;

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param0_constStdStringRef")

			return true;
		}

		//---------------------------------------------------
		// Exposing the functionality
		//---------------------------------------------------
		JSBool init(JSContext* cx, JSObject* scope)
		{
			JSFunctionSpec functions[] = {
				JS_FS("print",            print_wrap,             1, 0),

				JS_FS_END
			};

			if(!JS_DefineFunctions(cx, scope, functions))
				return false;

			return true;
		}
	}
}