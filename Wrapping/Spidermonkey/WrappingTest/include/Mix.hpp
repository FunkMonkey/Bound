#ifndef MIX_HPP
#define MIX_HPP

#include <string>

//---------------------------------------------------
// Builtin types: bool, integer, floating point
//---------------------------------------------------
namespace Builtin
{
	//---------------------------------------------------
	// VOID FUNCTION, NO PARAMETER
	//---------------------------------------------------

	void void_param0();

	//---------------------------------------------------
	// VOID FUNCTION, 1 PARAMETER
	//---------------------------------------------------

	void void_param1_bool            (bool x);

	void void_param1_char            (char x);
	void void_param1_signed_char     (signed char x);
	void void_param1_unsigned_char   (unsigned char x);
	void void_param1_short           (short x);
	void void_param1_unsigned_short  (unsigned short x);
	void void_param1_int             (int x);
	void void_param1_unsigned_int    (unsigned int x);
	void void_param1_long            (long x);
	void void_param1_unsigned_long   (unsigned long x);

	void void_param1_float           (float x);
	void void_param1_double          (double x);
	void void_param1_long_double     (long double x);

	void void_param1_wchar_t         (wchar_t x);

	//---------------------------------------------------
	// RETURN VALUE, NO PARAMETER
	//---------------------------------------------------

	bool           bool_param0            ();

	char           char_param0            ();
	signed char    signed_char_param0     ();
	unsigned char  unsigned_char_param0   ();
	short          short_param0           ();
	unsigned short unsigned_short_param0  ();
	int            int_param0             ();
	unsigned int   unsigned_int_param0    ();
	long           long_param0            ();
	unsigned long  unsigned_long_param0   ();

	float          float_param0           ();
	double         double_param0          ();
	long double    long_double_param0     ();

	wchar_t        wchar_t_param0         ();

	//---------------------------------------------------
	// OTHER COMBINATIONS
	//---------------------------------------------------
	void void_param1_int_float  (int x, float y);
	int  int_param1_int         (int x);
	int  int_param1_int_float   (int x, float y);
}

//---------------------------------------------------
// Strings: character arrays, std::string
//---------------------------------------------------
namespace Strings
{
	//---------------------------------------------------
	// VOID FUNCTION, 1 PARAMETER
	//---------------------------------------------------
	void void_param0_constCharPtr        (const char* str);

	void void_param0_stdString           (std::string str);
	void void_param0_constStdStringRef   (const std::string& str);

	// original JSStrings will not be effected
	void void_param0_charPtr             (char* str);
	void void_param0_stdStringRef        (std::string& val);

	//---------------------------------------------------
	// RETURN VALUE, NO PARAMETER
	//---------------------------------------------------

	const char*          constCharPtr_param0       ();

	std::string          stdString_param0          ();
	const std::string&   constStdStringRef_param0  ();
	const std::string*   constStdStringPtr_param0  ();

	// original C++ strings will not be effected
	std::string&         stdStringRef_param0       ();
	std::string*         stdStringPtr_param0       ();
}

//---------------------------------------------------
// A simple class with members
//---------------------------------------------------
namespace Classes
{
	class SampleClass
	{
		public:
			int memberFunc(float param);
			static void staticMemberFunc();
	};
}

//---------------------------------------------------
// Inheritance
//---------------------------------------------------
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

//---------------------------------------------------
// Using classes and ownership
//---------------------------------------------------
namespace UsingAndOwnership
{
	class ClassScriptOwned
	{
		public:
			void func();
	};
	
	void passScriptOwnedCopy(ClassScriptOwned copy);
	void passScriptOwnedRef(ClassScriptOwned& ref);
	void passScriptOwnedPtr(ClassScriptOwned* ptr);
	
	ClassScriptOwned  returnScriptOwnedCopy();
	
	// should be prohibited by restrictions
	ClassScriptOwned& returnScriptOwnedRef();
	ClassScriptOwned* returnScriptOwnedPtr();
	
	class ClassNativeOwned
	{
		public:
			void func();
	};
	
	void passNativeOwnedCopy(ClassNativeOwned copy);
	void passNativeOwnedRef(ClassNativeOwned& ref);
	void passNativeOwnedPtr(ClassNativeOwned* ptr);
	
	// should be prohibited by restrictions
	ClassNativeOwned  returnNativeOwnedCopy();
	
	ClassNativeOwned& returnNativeOwnedRef();
	ClassNativeOwned* returnNativeOwnedPtr();
}

#endif