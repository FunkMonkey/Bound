#ifndef FUNCTIONS_STRINGS_HPP
#define FUNCTIONS_STRINGS_HPP

#include <string>

//---------------------------------------------------
// VOID FUNCTION, 1 PARAMETER
//---------------------------------------------------
void void_param0_constCharPtr        (const char* str){}

void void_param0_stdString           (std::string str){}
void void_param0_constStdStringRef   (const std::string& str){}

// complicated / different behaviour
void void_param0_charPtr             (char* str){}
void void_param0_stdStringRef        (std::string& val){}

//---------------------------------------------------
// RETURN VALUE, NO PARAMETER
//---------------------------------------------------

char * charPtr;
std::string stdString;

const char*          constCharPtr              (){ return ""; }

std::string          stdString_param0          (){ return ""; }
const std::string&   constStdStringRef_param0  (){ return ""; }
const std::string*   constStdStringPtr_param0  (){ return &""; }

// complicated / differing behaviour
char*                charPtr_param0            (){ return charPtr; }
std::string&         stdStringRef_param0       (){ return stdString; }
std::string*         stdStringPtr_param0       (){ return &stdString; }



#endif // FUNCTIONS_STRINGS_HPP