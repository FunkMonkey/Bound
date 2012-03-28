#ifndef MIX_HPP
#define MIX_HPP

#include <string>
#include <sstream>

//---------------------------------------------------
// Helpers for script testing
//---------------------------------------------------
int         lastInstance = 0;
std::string lastFunc;
std::stringstream lastParam1;
std::stringstream lastParam2;

int         getLastInstance()       { return lastInstance; }
const std::string& getLastFunction(){ return lastFunc; }
std::string getLastParam1(){ return lastParam1.str(); }
std::string getLastParam2(){ return lastParam2.str(); }


//---------------------------------------------------
// Builtin types: bool, integer, floating point
//---------------------------------------------------
namespace Builtin
{
	//---------------------------------------------------
	// VOID FUNCTION, NO PARAMETER
	//---------------------------------------------------

	void void_param0(){}

	//---------------------------------------------------
	// VOID FUNCTION, 1 PARAMETER
	//---------------------------------------------------

	void void_param1_bool            (bool x)            {}

	void void_param1_char            (char x)            {}
	void void_param1_signed_char     (signed char x)     {}
	void void_param1_unsigned_char   (unsigned char x)   {}
	void void_param1_short           (short x)           {}
	void void_param1_unsigned_short  (unsigned short x)  {}
	void void_param1_int             (int x)             {}
	void void_param1_unsigned_int    (unsigned int x)    {}
	void void_param1_long            (long x)            {}
	void void_param1_unsigned_long   (unsigned long x)   {}

	void void_param1_float           (float x)           {}
	void void_param1_double          (double x)          {}
	void void_param1_long_double     (long double x)     {}

	void void_param1_wchar_t         (wchar_t x)         {}

	//---------------------------------------------------
	// RETURN VALUE, NO PARAMETER
	//---------------------------------------------------

	bool           bool_param0            (){ return true; }

	char           char_param0            (){ return 8; }
	signed char    signed_char_param0     (){ return 8; }
	unsigned char  unsigned_char_param0   (){ return 8; }
	short          short_param0           (){ return 8; }
	unsigned short unsigned_short_param0  (){ return 8; }
	int            int_param0             (){ return 8; }
	unsigned int   unsigned_int_param0    (){ return 8; }
	long           long_param0            (){ return 8; }
	unsigned long  unsigned_long_param0   (){ return 8; }

	float          float_param0           (){ return 8.5f; }
	double         double_param0          (){ return 8.5; }
	long double    long_double_param0     (){ return 8.5; }

	wchar_t        wchar_t_param0         (){ return 8; }

	//---------------------------------------------------
	// OTHER COMBINATIONS
	//---------------------------------------------------
	void void_param1_int_float  (int x, float y)  {}
	int  int_param1_int         (int x)           { return 8; }
	int  int_param1_int_float   (int x, float y)  { return 8; }
}

//---------------------------------------------------
// Strings: character arrays, std::string
//---------------------------------------------------
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
	
	// ==== DEFINITIONS ====
	int SampleClass::memberFunc(float param){ lastInstance = (int)this; lastFunc = "Classes::SampleClass::memberFunc"; lastParam1.str(""); lastParam1 << param;  return 8; }
	void SampleClass::staticMemberFunc(){ lastInstance = 0; lastFunc = "Classes::SampleClass::staticMemberFunc"; };
}

//---------------------------------------------------
// Strings: Inheritance
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
	
	// ==== DEFINITIONS ====
	void BaseClass::baseFunc(){ lastInstance = (int)this; lastFunc = "Inheritance::BaseClass::baseFunc"; };
	void SubClass::subFunc()  { lastInstance = (int)this; lastFunc = "Inheritance::SubClass::subFunc"; };
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
	
	// ==== DEFINITIONS ====
	void ClassScriptOwned::func(){ lastInstance = (int)this; lastFunc = "UsingAndOwnership::ClassScriptOwned::func"; };
	void passScriptOwnedCopy(ClassScriptOwned copy);
	void passScriptOwnedRef(ClassScriptOwned& ref);
	void passScriptOwnedPtr(ClassScriptOwned* ptr);
	ClassScriptOwned  returnScriptOwnedCopy(){return ClassScriptOwned(); }
	ClassScriptOwned& returnScriptOwnedRef(){ return *(new ClassScriptOwned()); }
	ClassScriptOwned* returnScriptOwnedPtr(){ return new ClassScriptOwned(); }
	
	void ClassNativeOwned::func(){ lastInstance = (int)this; lastFunc = "UsingAndOwnership::ClassNativeOwned::func"; };
	void passNativeOwnedCopy(ClassNativeOwned copy){}
	void passNativeOwnedRef(ClassNativeOwned& ref){}
	void passNativeOwnedPtr(ClassNativeOwned* ptr){}
	
	// should be prohibited by restrictions
	ClassNativeOwned  returnNativeOwnedCopy(){return ClassNativeOwned(); }
	
	ClassNativeOwned instance;
	ClassNativeOwned& returnNativeOwnedRef(){ return instance; }
	ClassNativeOwned* returnNativeOwnedPtr(){ return &instance; }
}

#endif