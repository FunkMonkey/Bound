#include "wrap_helpers/std_string_x.hpp"
#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include <GlobalFunctions.hpp>
#include "wrap_helpers/int_x.hpp"
#include "GlobalFunctionsWrap.hpp"

namespace jswrap { namespace GlobalFunctionsWrap { 
	
	JSBool wrapper_print(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			std::string& p0__str = jsval_to_stdString_convert_x(cx, args[0]);
	
			::print(p0__str);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}

	JSBool wrapper_printNoBreak(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START

			checkMinNumberOfArguments_x(argc, 1);
		jsval* args = JS_ARGV(cx, vp);

		std::string& p0__str = jsval_to_stdString_convert_x(cx, args[0]);

		::printNoBreak(p0__str);

		JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")

			return true;
	}
	
	JSBool wrapper_getLastInstance(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			int cpp__result = ::getLastInstance();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_getLastFunction(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			const ::std::string & cpp__result = ::getLastFunction();
		
			stdString_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_getLastParam1(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::std::string cpp__result = ::getLastParam1();
		
			stdString_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_getLastParam2(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::std::string cpp__result = ::getLastParam2();
		
			stdString_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSFunctionSpec functionsDefs[] = {
			JS_FS("print", wrapper_print, 1, 0),
			JS_FS("printNoBreak", wrapper_printNoBreak, 1, 0),
			JS_FS("getLastInstance", wrapper_getLastInstance, 0, 0),
			JS_FS("getLastFunction", wrapper_getLastFunction, 0, 0),
			JS_FS("getLastParam1", wrapper_getLastParam1, 0, 0),
			JS_FS("getLastParam2", wrapper_getLastParam2, 0, 0),

			JS_FS_END
		};
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
			if(!JS_DefineFunctions(cx, scope, functionsDefs))
			return false;
			
		return true;
	}
	
} } 

