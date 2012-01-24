#ifndef FUNCTIONS_BASICTYPES_HPP
#define FUNCTIONS_BASICTYPES_HPP

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