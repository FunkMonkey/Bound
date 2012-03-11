#ifndef JSWRAP_PROJECTNAME_USINGSIMPLECLASS_HPP
#define JSWRAP_PROJECTNAME_USINGSIMPLECLASS_HPP

#include "jsapi.h"
#include <D:/Data/Projekte/Bound/src/CPPAnalyzer/Test/UsingSimpleClass.hpp>

namespace jswrap { namespace ProjectName { namespace UsingSimpleClass { 
	extern JSObject* jsPrototype;
	extern JSObject* jsConstructor;
	extern JSClass jsClass;
	JSBool init(JSContext* cx, JSObject* scope);
	
} } } 



#endif // JSWRAP_PROJECTNAME_USINGSIMPLECLASS_HPP