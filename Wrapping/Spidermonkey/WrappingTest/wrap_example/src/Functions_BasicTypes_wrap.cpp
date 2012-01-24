#include "Functions_BasicTypes_wrap.hpp"
#include "Functions_BasicTypes.hpp"

#include "wrap_helpers/wrap_helpers_x.hpp"
#include "wrap_helpers/boolean_x.hpp"
#include "wrap_helpers/int_x.hpp"
#include "wrap_helpers/float_x.hpp"

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
				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param0")

			return true;
		}

		//---------------------------------------------------
		// VOID FUNCTION, 1 PARAMETER
		//---------------------------------------------------


		//void void_param1_bool     (bool x)     {}
		JSBool void_param1_bool_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				bool x = jsval_to_boolean_convert_x(cx, args[0]);
				void_param1_bool(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_bool")

			return true;
		}

		//void void_param1_char     (char x)     {}
		JSBool void_param1_char_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				char x = jsval_to_int32_x(cx, args[0]);
				void_param1_char(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_char")

			return true;
		}

		
		//void void_param1_signed_char     (signed char x)     {}
		JSBool void_param1_signed_char_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				signed char x = jsval_to_int32_x(cx, args[0]);
				void_param1_signed_char(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_signed_char")

			return true;
		}

		//void void_param1_unsigned_char   (unsigned char x)   {}
		JSBool void_param1_unsigned_char_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				unsigned char x = jsval_to_uint32_x(cx, args[0]);
				void_param1_unsigned_char(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_signed_char")

			return true;
		}

		//void void_param1_short           (short x)           {}
		JSBool void_param1_short_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				short x = jsval_to_int32_x(cx, args[0]);
				void_param1_short(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_short")

			return true;
		}

		//void void_param1_unsigned_short  (unsigned short x)  {}
		JSBool void_param1_unsigned_short_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				unsigned short x = jsval_to_uint32_x(cx, args[0]);
				void_param1_unsigned_short(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_unsigned_short")

			return true;
		}

		//void void_param1_int             (int x)             {}
		JSBool void_param1_int_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				int x = jsval_to_int32_x(cx, args[0]);
				void_param1_int(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_int")

			return true;
		}

		//void void_param1_unsigned_int    (unsigned int x)    {}
		JSBool void_param1_unsigned_int_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				unsigned int x = jsval_to_uint32_x(cx, args[0]);
				void_param1_unsigned_int(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_unsigned_int")

			return true;
		}

		//void void_param1_long            (long x)            {}
		JSBool void_param1_long_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				long x = jsval_to_int32_x(cx, args[0]);
				void_param1_long(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_long")

			return true;
		}

		//void void_param1_unsigned_long            (unsigned long x)   {}
		JSBool void_param1_unsigned_long_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				unsigned long x = jsval_to_uint32_x(cx, args[0]);
				void_param1_unsigned_long(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_unsigned_long")

			return true;
		}

		//void void_param1_float           (float x)           {}
		JSBool void_param1_float_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				float x = (float)jsval_to_double_x(cx, args[0]);
				void_param1_float(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_float")

			return true;
		}

		//void void_param1_double          (double x)          {}
		JSBool void_param1_double_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				double x = jsval_to_double_x(cx, args[0]);
				void_param1_double(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_double")

			return true;
		}

		//void void_param1_long_double     (long double x)     {}
		JSBool void_param1_long_double_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				long double x = jsval_to_double_x(cx, args[0]);
				void_param1_long_double(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_long_double")

			return true;
		}

		//void void_param1_wchar_t         (wchar_t x)         {}
		JSBool void_param1_wchar_t_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				wchar_t x = jsval_to_wchar_t_x(cx, args[0]);
				void_param1_wchar_t(x);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_wchar_t")
			
			return true;
		}

		//---------------------------------------------------
		// RETURN VALUE, NO PARAMETER
		//---------------------------------------------------

		//     bool_param0
		JSBool bool_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				bool cppResult = bool_param0();

			JS_SET_RVAL(cx, vp, BOOLEAN_TO_JSVAL(cppResult));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "bool_param0")

			
			return true;
		}

		//     char_param0
		JSBool char_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				char cppResult = char_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "char_param0")
			
			return true;
		}

		//     signed_char_param0
		JSBool signed_char_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				signed char cppResult = signed_char_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "signed_char_param0")
			
			return true;
		}

		//     unsigned_char_param0
		JSBool unsigned_char_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				unsigned char cppResult = unsigned_char_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "unsigned_char_param0")
			
			return true;
		}

		//     short_param0
		JSBool short_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				short cppResult = short_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "short_param0")
			
			return true;
		}

		//     unsigned_short_param0
		JSBool unsigned_short_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				unsigned short cppResult = unsigned_short_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "unsigned_short_param0")
			
			return true;
		}

		//     int_param0
		JSBool int_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				int cppResult = int_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "int_param0")
			
			return true;
		}

		//     unsigned_int_param0
		JSBool unsigned_int_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				unsigned int cppResult = unsigned_int_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "unsigned_int_param0")
			
			return true;
		}

		//     long_param0
		JSBool long_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				long cppResult = long_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "long_param0")
			
			return true;
		}

		//     unsigned_long_param0
		JSBool unsigned_long_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				unsigned long cppResult = unsigned_long_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "unsigned_long_param0")
			
			return true;
		}

		//     float_param0
		JSBool float_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				float cppResult = float_param0();
				double_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "float_param0")
			
			return true;
		}

		//     double_param0
		JSBool double_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				double cppResult = double_param0();
				double_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "double_param0")
			
			return true;
		}

		//     long_double_param0
		JSBool long_double_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				long double cppResult = long_double_param0();
				double_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "long_double_param0")
			
			return true;
		}
		
		//     wchar_t_param0         (){ return 1; }
		JSBool wchar_t_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				wchar_t cppResult = wchar_t_param0();
				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "wchar_t_param0")
			
			return true;
		}

		//---------------------------------------------------
		// OTHER COMBINATIONS
		//---------------------------------------------------

		//     void_param1_int_float
		JSBool void_param1_int_float_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 2);

				jsval* args = JS_ARGV(cx, vp);

				int x = jsval_to_int32_x(cx, args[0]);
				float y = (float) jsval_to_double_x(cx, args[1]);
				void_param1_int_float(x, y);

				JS_SET_RVAL(cx, vp, JSVAL_VOID);

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_int_float")

			return true;
		}

		//     int_param1_int
		JSBool int_param1_int_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 1);

				jsval* args = JS_ARGV(cx, vp);

				int x = jsval_to_int32_x(cx, args[0]);
				int cppResult = int_param1_int(x);

				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "int_param1_int")

			return true;
		}

		//     int_param1_int_float
		JSBool int_param1_int_float_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				checkMinNumberOfArguments_x(argc, 2);

				jsval* args = JS_ARGV(cx, vp);

				int x = jsval_to_int32_x(cx, args[0]);
				float y = (float) jsval_to_double_x(cx, args[1]);
				int cppResult = int_param1_int_float(x, y);

				int_to_jsval_x(cx, cppResult, &JS_RVAL(cx, vp));

			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "void_param1_int_float")

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
				JS_FS("bool_param0",                 bool_param0_wrap,                  0, 0),
				JS_FS("char_param0",                 char_param0_wrap,                  0, 0),
				JS_FS("signed_char_param0",          signed_char_param0_wrap,           0, 0),
				JS_FS("unsigned_char_param0",        unsigned_char_param0_wrap,         0, 0),
				JS_FS("short_param0",                short_param0_wrap,                 0, 0),
				JS_FS("unsigned_short_param0",       unsigned_short_param0_wrap,        0, 0),
				JS_FS("int_param0",                  int_param0_wrap,                   0, 0),
				JS_FS("unsigned_int_param0",         unsigned_int_param0_wrap,          0, 0),
				JS_FS("long_param0",                 long_param0_wrap,                  0, 0),
				JS_FS("unsigned_long_param0",        unsigned_long_param0_wrap,         0, 0),
				JS_FS("float_param0",                float_param0_wrap,                 0, 0),
				JS_FS("double_param0",               double_param0_wrap,                0, 0),
				JS_FS("long double_param0",          long_double_param0_wrap,           0, 0),
				JS_FS("wchar_t_param0",              wchar_t_param0_wrap,               0, 0),

				// OTHER COMBINATIONS
				JS_FS("void_param1_int_float",       void_param1_int_float_wrap,        2, 0),
				JS_FS("int_param1_int",              int_param1_int_wrap,               1, 0),
				JS_FS("int_param1_int_float",        int_param1_int_float_wrap,         2, 0),

				JS_FS_END
			};

			if(!JS_DefineFunctions(cx, scope, functions))
				return false;

			return true;
		}
	}
}