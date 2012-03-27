#include "wrap_helpers/char_string_x.hpp"
#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include <Functions_Strings.hpp>
#include "wrap_helpers/std_string_x.hpp"
#include "ProjectName.hpp"

namespace jswrap { namespace ProjectName { 
	
	JSBool wrapper_void_param0_constCharPtr(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			char* p0__str = jsval_to_char_array_x(cx, args[0]); /* TODO: clean up */
	
			::void_param0_constCharPtr(p0__str);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param0_stdString(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			std::string p0__str = jsval_to_stdString_x(cx, args[0]);
	
			::void_param0_stdString(p0__str);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param0_constStdStringRef(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			std::string& p0__str = jsval_to_stdString_x(cx, args[0]);
	
			::void_param0_constStdStringRef(p0__str);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param0_charPtr(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			char* p0__str = jsval_to_char_array_x(cx, args[0]); /* TODO: clean up */
	
			::void_param0_charPtr(p0__str);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param0_stdStringRef(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			std::string& p0__val = jsval_to_stdString_x(cx, args[0]);
	
			::void_param0_stdStringRef(p0__val);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_constCharPtr_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			const char * cpp__result = ::constCharPtr_param0();
		
			nullterminated_char_array_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_stdString_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::std::string cpp__result = ::stdString_param0();
		
			stdString_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_constStdStringRef_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			const ::std::string & cpp__result = ::constStdStringRef_param0();
		
			stdString_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_constStdStringPtr_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			const ::std::string * cpp__result = ::constStdStringPtr_param0();
		
			stdString_to_jsval_x(cx, *cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_charPtr_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			char * cpp__result = ::charPtr_param0();
		
			nullterminated_char_array_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_stdStringRef_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::std::string & cpp__result = ::stdStringRef_param0();
		
			stdString_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_stdStringPtr_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::std::string * cpp__result = ::stdStringPtr_param0();
		
			stdString_to_jsval_x(cx, *cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSFunctionSpec functionsDefs[] = {
			JS_FS("void_param0_constCharPtr", wrapper_void_param0_constCharPtr, 1, 0),
			JS_FS("void_param0_stdString", wrapper_void_param0_stdString, 1, 0),
			JS_FS("void_param0_constStdStringRef", wrapper_void_param0_constStdStringRef, 1, 0),
			JS_FS("void_param0_charPtr", wrapper_void_param0_charPtr, 1, 0),
			JS_FS("void_param0_stdStringRef", wrapper_void_param0_stdStringRef, 1, 0),
			JS_FS("constCharPtr_param0", wrapper_constCharPtr_param0, 0, 0),
			JS_FS("stdString_param0", wrapper_stdString_param0, 0, 0),
			JS_FS("constStdStringRef_param0", wrapper_constStdStringRef_param0, 0, 0),
			JS_FS("constStdStringPtr_param0", wrapper_constStdStringPtr_param0, 0, 0),
			JS_FS("charPtr_param0", wrapper_charPtr_param0, 0, 0),
			JS_FS("stdStringRef_param0", wrapper_stdStringRef_param0, 0, 0),
			JS_FS("stdStringPtr_param0", wrapper_stdStringPtr_param0, 0, 0),

			JS_FS_END
		};
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
			if(!JS_DefineFunctions(cx, scope, functionsDefs))
			return false;
			
		return true;
	}
	
} } 

