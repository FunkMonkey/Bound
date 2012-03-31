#ifndef JSWRAP_PROJECTNAME_INHERITANCE_SUBCLASS_HPP
#define JSWRAP_PROJECTNAME_INHERITANCE_SUBCLASS_HPP

#include "jsapi.h"
#include <Mix.hpp>

namespace jswrap { namespace ProjectName { namespace Inheritance { namespace SubClass { 
	extern JSObject* jsPrototype;
	extern JSObject* jsConstructor;
	extern JSClass jsClass;
	JSBool init(JSContext* cx, JSObject* scope);
	
	::Inheritance::SubClass* getFromJSValue(JSContext* cx, jsval val);
} } } } 



#endif // JSWRAP_PROJECTNAME_INHERITANCE_SUBCLASS_HPP