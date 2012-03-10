#include "UsingSimpleClass.hpp"

#include <iostream>

SimpleClass UsingSimpleClass::staticPropField = SimpleClass();

void UsingSimpleClass::passCopy(SimpleClass copy)
{
	std::cout << "Called passCopy: " << copy.getIntProp() << "\n";
}

void UsingSimpleClass::passRef(SimpleClass& ref)
{
	std::cout << "Called passRef: " << ref.getIntProp() << "\n";
}

void UsingSimpleClass::passPtr(SimpleClass* ptr)
{
	if(ptr)
		std::cout << "Called passPtr: " << ptr->getIntProp() << "\n";
	else
		std::cout << "Called passPtr: null\n";
}
