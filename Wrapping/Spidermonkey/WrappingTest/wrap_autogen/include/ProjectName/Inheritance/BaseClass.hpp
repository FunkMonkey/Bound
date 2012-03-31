#ifndef JSWRAP_PROJECTNAME_INHERITANCE_BASECLASS_HPP
#define JSWRAP_PROJECTNAME_INHERITANCE_BASECLASS_HPP

#include "jsapi.h"
#include <Mix.hpp>

namespace jswrap { namespace ProjectName { namespace Inheritance { namespace BaseClass { 
	extern JSObject* jsPrototype;
	extern JSObject* jsConstructor;
	extern JSClass jsClass;
	JSBool init(JSContext* cx, JSObject* scope);
	
	::Inheritance::BaseClass* getFromJSValue(JSContext* cx, jsval val);
} } } } 



#endif // JSWRAP_PROJECTNAME_INHERITANCE_BASECLASS_HPP