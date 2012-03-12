#ifndef JSWRAP_PROJECTNAME_SIMPLECLASS_HPP
#define JSWRAP_PROJECTNAME_SIMPLECLASS_HPP

#include "jsapi.h"
#include <SimpleClass.hpp>

namespace jswrap { namespace ProjectName { namespace SimpleClass { 
	extern JSObject* jsPrototype;
	extern JSObject* jsConstructor;
	extern JSClass jsClass;
	JSBool init(JSContext* cx, JSObject* scope);
	
	JSObject* wrapInstance(JSContext* cx, const ::SimpleClass* ptr);
	JSObject* wrapCopy(JSContext* cx, const ::SimpleClass& ref);
	::SimpleClass* getFromJSValue(JSContext* cx, jsval val);
} } } 



#endif // JSWRAP_PROJECTNAME_SIMPLECLASS_HPP