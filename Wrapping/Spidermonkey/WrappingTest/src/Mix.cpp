#include "Mix.hpp"
#include "GlobalFunctions.hpp"

//---------------------------------------------------
// Builtin types: bool, integer, floating point
//---------------------------------------------------
namespace Builtin
{
	//---------------------------------------------------
	// VOID FUNCTION, NO PARAMETER
	//---------------------------------------------------

	void void_param0(){ lastFunc = "void_param0"; }

	//---------------------------------------------------
	// VOID FUNCTION, 1 PARAMETER
	//---------------------------------------------------

	void void_param1_bool            (bool x)            { lastFunc = "void_param1_bool"; lastParam1.str((x==true) ? "true" : "false"); }

	void void_param1_char            (char x)            { lastFunc = "void_param1_char"; lastParam1.str(""); lastParam1 << (int)x;}
	void void_param1_signed_char     (signed char x)     { lastFunc = "void_param1_signed_char"; lastParam1.str(""); lastParam1 << (int)x;}
	void void_param1_unsigned_char   (unsigned char x)   { lastFunc = "void_param1_unsigned_char"; lastParam1.str(""); lastParam1 << (int)x;}
	void void_param1_short           (short x)           { lastFunc = "void_param1_short"; lastParam1.str(""); lastParam1 << x;}
	void void_param1_unsigned_short  (unsigned short x)  { lastFunc = "void_param1_unsigned_short"; lastParam1.str(""); lastParam1 << x;}
	void void_param1_int             (int x)             { lastFunc = "void_param1_int"; lastParam1.str(""); lastParam1 << x;}
	void void_param1_unsigned_int    (unsigned int x)    { lastFunc = "void_param1_unsigned_int"; lastParam1.str(""); lastParam1 << x;}
	void void_param1_long            (long x)            { lastFunc = "void_param1_long"; lastParam1.str(""); lastParam1 << x;}
	void void_param1_unsigned_long   (unsigned long x)   { lastFunc = "void_param1_unsigned_long"; lastParam1.str(""); lastParam1 << x;}

	void void_param1_float           (float x)           { lastFunc = "void_param1_float"; lastParam1.str(""); lastParam1 << x;}
	void void_param1_double          (double x)          { lastFunc = "void_param1_double"; lastParam1.str(""); lastParam1 << x;}
	void void_param1_long_double     (long double x)     { lastFunc = "void_param1_long_double"; lastParam1.str(""); lastParam1 << x;}

	void void_param1_wchar_t         (wchar_t x)         { lastFunc = "void_param1_wchar_t"; lastParam1.str(""); lastParam1 << (int)x;}

	//---------------------------------------------------
	// RETURN VALUE, NO PARAMETER
	//---------------------------------------------------

	bool           bool_param0            (){ lastFunc = "bool_param0"; return true; }

	char           char_param0            (){ lastFunc = "char_param0"; return 8; }
	signed char    signed_char_param0     (){ lastFunc = "signed_char_param0"; return 8; }
	unsigned char  unsigned_char_param0   (){ lastFunc = "unsigned_char_param0"; return 8; }
	short          short_param0           (){ lastFunc = "short_param0"; return 8; }
	unsigned short unsigned_short_param0  (){ lastFunc = "unsigned_short_param0"; return 8; }
	int            int_param0             (){ lastFunc = "int_param0"; return 8; }
	unsigned int   unsigned_int_param0    (){ lastFunc = "unsigned_int_param0"; return 8; }
	long           long_param0            (){ lastFunc = "long_param0"; return 8; }
	unsigned long  unsigned_long_param0   (){ lastFunc = "unsigned_long_param0"; return 8; }

	float          float_param0           (){ lastFunc = "float_param0"; return 8.5f; }
	double         double_param0          (){ lastFunc = "double_param0"; return 8.5; }
	long double    long_double_param0     (){ lastFunc = "long_double_param0"; return 8.5; }

	wchar_t        wchar_t_param0         (){ lastFunc = "wchar_t_param0"; return 8; }

	//---------------------------------------------------
	// OTHER COMBINATIONS
	//---------------------------------------------------
	void void_param1_int_float  (int x, float y)  { lastFunc = "void_param1_int_float"; lastParam1.str(""); lastParam1 << x; lastParam2.str(""); lastParam2 << y;}
	int  int_param1_int         (int x)           { lastFunc = "int_param1_int";  lastParam1.str(""); lastParam1 << x; return 8; }
	int  int_param1_int_float   (int x, float y)  { lastFunc = "int_param1_int_float"; lastParam1.str(""); lastParam1 << x; lastParam2.str(""); lastParam2 << y; return 8; }
}

//---------------------------------------------------
// Strings: character arrays, std::string
//---------------------------------------------------
namespace Strings
{
	//---------------------------------------------------
	// VOID FUNCTION, 1 PARAMETER
	//---------------------------------------------------
	void void_param0_constCharPtr        (const char* str){lastFunc = "void_param0_constCharPtr"; lastParam1.str(""); lastParam1 << str;}

	void void_param0_stdString           (std::string str){lastFunc = "void_param0_stdString"; lastParam1.str(""); lastParam1 << str;}
	void void_param0_constStdStringRef   (const std::string& str){lastFunc = "void_param0_constStdStringRef"; lastParam1.str(""); lastParam1 << str;}

	// original JSStrings will not be effected
	void void_param0_charPtr             (char* str){lastFunc = "void_param0_charPtr"; lastParam1.str(""); lastParam1 << str;}
	void void_param0_stdStringRef        (std::string& val){lastFunc = "void_param0_stdStringRef"; lastParam1.str(""); lastParam1 << val;}

	//---------------------------------------------------
	// RETURN VALUE, NO PARAMETER
	//---------------------------------------------------

	std::string stdString("ReturnString");

	const char*          constCharPtr_param0       (){ lastFunc = "constCharPtr_param0"; return "ReturnString"; }

	std::string          stdString_param0          (){ lastFunc = "stdString_param0"; return stdString; }
	const std::string&   constStdStringRef_param0  (){ lastFunc = "constStdStringRef_param0"; return stdString; }
	const std::string*   constStdStringPtr_param0  (){ lastFunc = "constStdStringPtr_param0"; return &stdString; }

	// original C++ strings will not be effected
	std::string&         stdStringRef_param0       (){ lastFunc = "stdStringRef_param0"; return stdString; }
	std::string*         stdStringPtr_param0       (){ lastFunc = "stdStringPtr_param0"; return &stdString; }
}

//---------------------------------------------------
// A simple class with members
//---------------------------------------------------
namespace Classes
{
	int SampleClass::memberFunc(float param){ lastInstance = (int)this; lastFunc = "memberFunc"; lastParam1.str(""); lastParam1 << param;  return 8; }
	void SampleClass::staticMemberFunc(){ lastInstance = 0; lastFunc = "staticMemberFunc"; };
}

//---------------------------------------------------
// Strings: Inheritance
//---------------------------------------------------
namespace Inheritance
{
	void BaseClass::baseFunc(){ lastInstance = (int)this; lastFunc = "baseFunc"; };
	void SubClass::subFunc()  { lastInstance = (int)this; lastFunc = "subFunc"; };
}

//---------------------------------------------------
// Using classes and ownership
//---------------------------------------------------
namespace UsingAndOwnership
{
	void ClassScriptOwned::func(){ lastInstance = (int)this; lastFunc = "func"; };
	void passScriptOwnedCopy(ClassScriptOwned copy);
	void passScriptOwnedRef(ClassScriptOwned& ref);
	void passScriptOwnedPtr(ClassScriptOwned* ptr);
	ClassScriptOwned  returnScriptOwnedCopy(){return ClassScriptOwned(); }
	ClassScriptOwned& returnScriptOwnedRef(){ return *(new ClassScriptOwned()); }
	ClassScriptOwned* returnScriptOwnedPtr(){ return new ClassScriptOwned(); }
	
	void ClassNativeOwned::func(){ lastInstance = (int)this; lastFunc = "func"; };
	void passNativeOwnedCopy(ClassNativeOwned copy){}
	void passNativeOwnedRef(ClassNativeOwned& ref){}
	void passNativeOwnedPtr(ClassNativeOwned* ptr){}
	
	// should be prohibited by restrictions
	ClassNativeOwned  returnNativeOwnedCopy(){return ClassNativeOwned(); }
	
	ClassNativeOwned instance;
	ClassNativeOwned& returnNativeOwnedRef(){ return instance; }
	ClassNativeOwned* returnNativeOwnedPtr(){ return &instance; }
}