
#include "wrap_helpers/wrap_helpers_x.hpp"
#include "Functions_BasicTypes.hpp"
#include "wrap_helpers/boolean_x.hpp"
#include "wrap_helpers/int_x.hpp"
#include "wrap_helpers/float_x.hpp"
#include "wrap_Test.hpp"

namespace jswrap
{

namespace wrap_Test
{
	JSBool wrapper_void_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			::void_param0();
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_bool(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			bool p__x = jsval_to_boolean_x(args[0]);
	
			::void_param1_bool(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_char(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			char p__x = jsval_to_int32_x(cx, args[0]);
	
			::void_param1_char(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_signed_char(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			signed char p__x = jsval_to_int32_x(cx, args[0]);
	
			::void_param1_signed_char(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_unsigned_char(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			unsigned char p__x = jsval_to_uint32_x(cx, args[0]);
	
			::void_param1_unsigned_char(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_short(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			short p__x = jsval_to_int32_x(cx, args[0]);
	
			::void_param1_short(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_unsigned_short(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			unsigned short p__x = jsval_to_uint32_x(cx, args[0]);
	
			::void_param1_unsigned_short(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_int(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			int p__x = jsval_to_int32_x(cx, args[0]);
	
			::void_param1_int(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_unsigned_int(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			unsigned int p__x = jsval_to_uint32_x(cx, args[0]);
	
			::void_param1_unsigned_int(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_long(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			long p__x = jsval_to_int32_x(cx, args[0]);
	
			::void_param1_long(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_unsigned_long(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			unsigned long p__x = jsval_to_uint32_x(cx, args[0]);
	
			::void_param1_unsigned_long(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_float(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			float p__x = jsval_to_double_x(cx, args[0]);
	
			::void_param1_float(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_double(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			double p__x = jsval_to_double_x(cx, args[0]);
	
			::void_param1_double(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_long_double(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			long double p__x = jsval_to_double_x(cx, args[0]);
	
			::void_param1_long_double(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_wchar_t(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			wchar_t p__x = jsval_to_int32_x(cx, args[0]);
	
			::void_param1_wchar_t(p__x);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_bool_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			bool cpp__result = ::bool_param0();
		
			JS_SET_RVAL(cx, vp, BOOLEAN_TO_JSVAL(cpp__result));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_char_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			char cpp__result = ::char_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_signed_char_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			signed char cpp__result = ::signed_char_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_unsigned_char_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			unsigned char cpp__result = ::unsigned_char_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_short_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			short cpp__result = ::short_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_unsigned_short_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			unsigned short cpp__result = ::unsigned_short_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_int_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			int cpp__result = ::int_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_unsigned_int_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			unsigned int cpp__result = ::unsigned_int_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_long_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			long cpp__result = ::long_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_unsigned_long_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			unsigned long cpp__result = ::unsigned_long_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_float_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			float cpp__result = ::float_param0();
		
			double_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_double_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			double cpp__result = ::double_param0();
		
			double_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_long_double_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			long double cpp__result = ::long_double_param0();
		
			double_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_wchar_t_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			wchar_t cpp__result = ::wchar_t_param0();
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_void_param1_int_float(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 2);
			jsval* args = JS_ARGV(cx, vp);
	
			int p__x = jsval_to_int32_x(cx, args[0]);
			float p__y = jsval_to_double_x(cx, args[1]);
	
			::void_param1_int_float(p__x, p__y);
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_int_param1_int(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			int p__x = jsval_to_int32_x(cx, args[0]);
	
			int cpp__result = ::int_param1_int(p__x);
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_int_param1_int_float(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 2);
			jsval* args = JS_ARGV(cx, vp);
	
			int p__x = jsval_to_int32_x(cx, args[0]);
			float p__y = jsval_to_double_x(cx, args[1]);
	
			int cpp__result = ::int_param1_int_float(p__x, p__y);
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}


	
	JSFunctionSpec functionsDefs[] = {
			JS_FS("void_param0", wrapper_void_param0, 0, 0),
			JS_FS("void_param1_bool", wrapper_void_param1_bool, 1, 0),
			JS_FS("void_param1_char", wrapper_void_param1_char, 1, 0),
			JS_FS("void_param1_signed_char", wrapper_void_param1_signed_char, 1, 0),
			JS_FS("void_param1_unsigned_char", wrapper_void_param1_unsigned_char, 1, 0),
			JS_FS("void_param1_short", wrapper_void_param1_short, 1, 0),
			JS_FS("void_param1_unsigned_short", wrapper_void_param1_unsigned_short, 1, 0),
			JS_FS("void_param1_int", wrapper_void_param1_int, 1, 0),
			JS_FS("void_param1_unsigned_int", wrapper_void_param1_unsigned_int, 1, 0),
			JS_FS("void_param1_long", wrapper_void_param1_long, 1, 0),
			JS_FS("void_param1_unsigned_long", wrapper_void_param1_unsigned_long, 1, 0),
			JS_FS("void_param1_float", wrapper_void_param1_float, 1, 0),
			JS_FS("void_param1_double", wrapper_void_param1_double, 1, 0),
			JS_FS("void_param1_long_double", wrapper_void_param1_long_double, 1, 0),
			JS_FS("void_param1_wchar_t", wrapper_void_param1_wchar_t, 1, 0),
			JS_FS("bool_param0", wrapper_bool_param0, 0, 0),
			JS_FS("char_param0", wrapper_char_param0, 0, 0),
			JS_FS("signed_char_param0", wrapper_signed_char_param0, 0, 0),
			JS_FS("unsigned_char_param0", wrapper_unsigned_char_param0, 0, 0),
			JS_FS("short_param0", wrapper_short_param0, 0, 0),
			JS_FS("unsigned_short_param0", wrapper_unsigned_short_param0, 0, 0),
			JS_FS("int_param0", wrapper_int_param0, 0, 0),
			JS_FS("unsigned_int_param0", wrapper_unsigned_int_param0, 0, 0),
			JS_FS("long_param0", wrapper_long_param0, 0, 0),
			JS_FS("unsigned_long_param0", wrapper_unsigned_long_param0, 0, 0),
			JS_FS("float_param0", wrapper_float_param0, 0, 0),
			JS_FS("double_param0", wrapper_double_param0, 0, 0),
			JS_FS("long_double_param0", wrapper_long_double_param0, 0, 0),
			JS_FS("wchar_t_param0", wrapper_wchar_t_param0, 0, 0),
			JS_FS("void_param1_int_float", wrapper_void_param1_int_float, 2, 0),
			JS_FS("int_param1_int", wrapper_int_param1_int, 1, 0),
			JS_FS("int_param1_int_float", wrapper_int_param1_int_float, 2, 0),

			JS_FS_END
		};
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
			if(!JS_DefineFunctions(cx, scope, functionsDefs))
			return false;
			
		return true;
	}
}

}

