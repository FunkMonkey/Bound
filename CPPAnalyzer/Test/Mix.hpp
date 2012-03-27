#ifndef MIX_HPP
#define MIX_HPP

#include <string>

namespace Builtin
{
	//---------------------------------------------------
	// VOID FUNCTION, NO PARAMETER
	//---------------------------------------------------

	static void void_param0(){}

	//---------------------------------------------------
	// VOID FUNCTION, 1 PARAMETER
	//---------------------------------------------------

	static void void_param1_bool            (bool x)            {}

	static void void_param1_char            (char x)            {}
	static void void_param1_signed_char     (signed char x)     {}
	static void void_param1_unsigned_char   (unsigned char x)   {}
	static void void_param1_short           (short x)           {}
	static void void_param1_unsigned_short  (unsigned short x)  {}
	static void void_param1_int             (int x)             {}
	static void void_param1_unsigned_int    (unsigned int x)    {}
	static void void_param1_long            (long x)            {}
	static void void_param1_unsigned_long   (unsigned long x)   {}

	static void void_param1_float           (float x)           {}
	static void void_param1_double          (double x)          {}
	static void void_param1_long_double     (long double x)     {}

	static void void_param1_wchar_t         (wchar_t x)         {}

	//---------------------------------------------------
	// RETURN VALUE, NO PARAMETER
	//---------------------------------------------------

	static bool           bool_param0            (){ return true; }

	static char           char_param0            (){ return 5; }
	static signed char    signed_char_param0     (){ return 5; }
	static unsigned char  unsigned_char_param0   (){ return 5; }
	static short          short_param0           (){ return 5; }
	static unsigned short unsigned_short_param0  (){ return 5; }
	static int            int_param0             (){ return 5; }
	static unsigned int   unsigned_int_param0    (){ return 5; }
	static long           long_param0            (){ return 5; }
	static unsigned long  unsigned_long_param0   (){ return 5; }

	static float          float_param0           (){ return 5.0f; }
	static double         double_param0          (){ return 5.0; }
	static long double    long_double_param0     (){ return 5.0; }

	static wchar_t        wchar_t_param0         (){ return 1; }

	//---------------------------------------------------
	// OTHER COMBINATIONS
	//---------------------------------------------------
	static void void_param1_int_float  (int x, float y)  {}
	static int  int_param1_int         (int x)           { return 1; }
	static int  int_param1_int_float   (int x, float y)  { return 1; }
}

namespace Strings
{
	//---------------------------------------------------
	// VOID FUNCTION, 1 PARAMETER
	//---------------------------------------------------
	void void_param0_constCharPtr        (const char* str){}

	void void_param0_stdString           (std::string str){}
	void void_param0_constStdStringRef   (const std::string& str){}

	// original JSStrings will not be effected
	void void_param0_charPtr             (char* str){}
	void void_param0_stdStringRef        (std::string& val){}

	//---------------------------------------------------
	// RETURN VALUE, NO PARAMETER
	//---------------------------------------------------

	std::string stdString("ReturnString");

	const char*          constCharPtr_param0       (){ return "ReturnString"; }

	std::string          stdString_param0          (){ return stdString; }
	const std::string&   constStdStringRef_param0  (){ return stdString; }
	const std::string*   constStdStringPtr_param0  (){ return &stdString; }

	// original C++ strings will not be effected
	std::string&         stdStringRef_param0       (){ return stdString; }
	std::string*         stdStringPtr_param0       (){ return &stdString; }
}

namespace Classes
{
	class SampleClass
	{
	};
}

namespace Inheritance
{
	class BaseClass
	{
		public:
			void baseFunc();
	};
	
	class SubClass: public BaseClass	
	{
		public:
			void subFunc();
	};
}

#endif