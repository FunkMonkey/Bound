#include "GlobalFunctions.hpp"

#include <sstream>
#include <iostream>

int         lastInstance = 0;
std::string lastFunc;
std::stringstream lastParam1;
std::stringstream lastParam2;

int         getLastInstance()       { return lastInstance; }
const std::string& getLastFunction(){ return lastFunc; }
std::string getLastParam1(){ return lastParam1.str(); }
std::string getLastParam2(){ return lastParam2.str(); }

void print(const std::string& str)
{
	std::cout << str.c_str() << "\n";
}

void printNoBreak(const std::string& str)
{
	std::cout << str.c_str();
}
