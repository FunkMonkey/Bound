#include "Functions_BasicTypes_wrap.hpp"
#include "Functions_BasicTypes.hpp"

#include "../wrap_helpers/wrap_helpers_x.hpp"
#include "../wrap_helpers/boolean_x.hpp"
#include "../wrap_helpers/int_x.hpp"
#include "../wrap_helpers/float_x.hpp"

namespace jswrap
{
	namespace Functions_BasicTypes
	{
		//---------------------------------------------------
		// VOID FUNCTION, NO PARAMETER
		//---------------------------------------------------

		JSBool void_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				void_param0();
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param0")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//---------------------------------------------------
		// VOID FUNCTION, 1 PARAMETER
		//---------------------------------------------------


		//void void_param1_bool     (bool x)     {}
		JSBool void_param1_bool_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				bool x = jsval_to_boolean_convert_x(cx, args[0]);
				void_param1_bool(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_bool")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_char     (char x)     {}
		JSBool void_param1_char_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				char x = jsval_to_int32_x(cx, args[0]);
				void_param1_char(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_char")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		
		//void void_param1_signed_char     (signed char x)     {}
		JSBool void_param1_signed_char_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				signed char x = jsval_to_int32_x(cx, args[0]);
				void_param1_signed_char(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_signed_char")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_unsigned_char   (unsigned char x)   {}
		JSBool void_param1_unsigned_char_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				unsigned char x = jsval_to_uint32_x(cx, args[0]);
				void_param1_unsigned_char(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_signed_char")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_short           (short x)           {}
		JSBool void_param1_short_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				short x = jsval_to_int32_x(cx, args[0]);
				void_param1_short(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_short")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_unsigned_short  (unsigned short x)  {}
		JSBool void_param1_unsigned_short_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				unsigned short x = jsval_to_uint32_x(cx, args[0]);
				void_param1_unsigned_short(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_unsigned_short")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_int             (int x)             {}
		JSBool void_param1_int_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				int x = jsval_to_int32_x(cx, args[0]);
				void_param1_int(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_int")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_unsigned_int    (unsigned int x)    {}
		JSBool void_param1_unsigned_int_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				unsigned int x = jsval_to_uint32_x(cx, args[0]);
				void_param1_unsigned_int(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_unsigned_int")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_long            (long x)            {}
		JSBool void_param1_long_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				long x = jsval_to_int32_x(cx, args[0]);
				void_param1_long(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_long")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_unsigned_long            (unsigned long x)   {}
		JSBool void_param1_unsigned_long_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				unsigned long x = jsval_to_uint32_x(cx, args[0]);
				void_param1_unsigned_long(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_unsigned_long")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_float           (float x)           {}
		JSBool void_param1_float_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				float x = (float)jsval_to_double_x(cx, args[0]);
				void_param1_float(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_float")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_double          (double x)          {}
		JSBool void_param1_double_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				double x = jsval_to_double_x(cx, args[0]);
				void_param1_double(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_double")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_long_double     (long double x)     {}
		JSBool void_param1_long_double_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				long double x = jsval_to_double_x(cx, args[0]);
				void_param1_long_double(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_long_double")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		//void void_param1_wchar_t         (wchar_t x)         {}
		JSBool void_param1_wchar_t_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				wchar_t x = jsval_to_wchar_t_x(cx, args[0]);
				void_param1_wchar_t(x);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_wchar_t")

			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}
		

		//---------------------------------------------------
		// Exposing the functionality
		//---------------------------------------------------
		JSBool init(JSContext* cx, JSObject* scope)
		{
			JSFunctionSpec functions[] = {

				// VOID FUNCTION, NO PARAMETER
				JS_FS("void_param0",                 void_param0_wrap,                  0, 0),

				// VOID FUNCTION, 1 PARAMETER
				JS_FS("void_param1_bool",            void_param1_bool_wrap,             1, 0),
				JS_FS("void_param1_char",            void_param1_char_wrap,             1, 0),
				JS_FS("void_param1_signed_char",     void_param1_signed_char_wrap,      1, 0),
				JS_FS("void_param1_unsigned_char",   void_param1_unsigned_char_wrap,    1, 0),
				JS_FS("void_param1_short",           void_param1_short_wrap,            1, 0),
				JS_FS("void_param1_unsigned_short",  void_param1_unsigned_short_wrap,   1, 0),
				JS_FS("void_param1_int",             void_param1_int_wrap,              1, 0),
				JS_FS("void_param1_unsigned_int",    void_param1_unsigned_int_wrap,     1, 0),
				JS_FS("void_param1_long",            void_param1_long_wrap,             1, 0),
				JS_FS("void_param1_unsigned_long",   void_param1_unsigned_long_wrap,    1, 0),
				JS_FS("void_param1_float",           void_param1_float_wrap,            1, 0),
				JS_FS("void_param1_double",          void_param1_double_wrap,           1, 0),
				JS_FS("void_param1_long_double",     void_param1_long_double_wrap,      1, 0),
				JS_FS("void_param1_wchar_t",         void_param1_wchar_t_wrap,          1, 0),

				// RETURN VALUE, NO PARAMETER

				JS_FS_END
			};

			if(!JS_DefineFunctions(cx, scope, functions))
				return false;

			return true;
		}
	}
}