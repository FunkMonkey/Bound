#ifndef FUNCTIONS_BASICTYPES_HPP
#define FUNCTIONS_BASICTYPES_HPP

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

char           char_param0            (){ return 5; }
signed char    signed_char_param0     (){ return 5; }
unsigned char  unsigned_char_param0   (){ return 5; }
short          short_param0           (){ return 5; }
unsigned short unsigned_short_param0  (){ return 5; }
int            int_param0             (){ return 5; }
unsigned int   unsigned_int_param0    (){ return 5; }
long           long_param0            (){ return 5; }
unsigned long  unsigned_long_param0   (){ return 5; }

float          float_param0           (){ return 5.0f; }
double         double_param0          (){ return 5.0; }
long double    long_double_param0     (){ return 5.0; }

wchar_t        wchar_t_param0         (){ return 1; }

//---------------------------------------------------
// OTHER COMBINATIONS
//---------------------------------------------------
void void_param1_int_float  (int x, float y)  {}
int  int_param1_int         (int x)           { return 1; }
int  int_param1_int_float   (int x, float y)  { return 1; }

/*
Clang fundamentals

CXType_Void = 2,
CXType_Bool = 3,
CXType_Char_U = 4,
CXType_UChar = 5,
CXType_Char16 = 6,
CXType_Char32 = 7,
CXType_UShort = 8,
CXType_UInt = 9,
CXType_ULong = 10,
CXType_ULongLong = 11,
CXType_UInt128 = 12,
CXType_Char_S = 13,
CXType_SChar = 14,
CXType_WChar = 15,
CXType_Short = 16,
CXType_Int = 17,
CXType_Long = 18,
CXType_LongLong = 19,
CXType_Int128 = 20,
CXType_Float = 21,
CXType_Double = 22,
CXType_LongDouble = 23

*/

#endif // FUNCTIONS_BASICTYPES_HPP