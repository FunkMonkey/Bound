#ifndef JSWRAP_PROJECTNAME_USINGANDOWNERSHIP_CLASSNATIVEOWNED_HPP
#define JSWRAP_PROJECTNAME_USINGANDOWNERSHIP_CLASSNATIVEOWNED_HPP

#include "jsapi.h"
#include <Mix.hpp>

namespace jswrap { namespace ProjectName { namespace UsingAndOwnership { namespace ClassNativeOwned { 
	extern JSObject* jsPrototype;
	extern JSObject* jsConstructor;
	extern JSClass jsClass;
	JSBool init(JSContext* cx, JSObject* scope);
	
	JSObject* wrapInstance(JSContext* cx, const ::UsingAndOwnership::ClassNativeOwned* ptr);
	::UsingAndOwnership::ClassNativeOwned* getFromJSValue(JSContext* cx, jsval val);
} } } } 



#endif // JSWRAP_PROJECTNAME_USINGANDOWNERSHIP_CLASSNATIVEOWNED_HPP