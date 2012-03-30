#ifndef GLOBAL_FUNCTIONS_HPP
#define GLOBAL_FUNCTIONS_HPP

#include <string>
#include <sstream>

void print(const std::string& str);
void printNoBreak(const std::string& str);

extern int         lastInstance;
extern std::string lastFunc;
extern std::stringstream lastParam1;
extern std::stringstream lastParam2;

int         getLastInstance();
const std::string& getLastFunction();
std::string getLastParam1();
std::string getLastParam2();


#endif // GLOBAL_FUNCTIONS_HPP