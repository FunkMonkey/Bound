#include "SimpleClass.hpp"

#include <iostream>

float SimpleClass::staticFloatPropField = 8.0f;
int SimpleClass::m_staticIntProp = 8;

void SimpleClass::void_param0()
{
	std::cout << "Called void_param0\n";
}

void SimpleClass::static_void_param0()
{
	std::cout << "Called static_void_param0\n";
}