#ifndef JSWRAP_PROJECTNAME_USINGANDOWNERSHIP_CLASSSCRIPTOWNED_HPP
#define JSWRAP_PROJECTNAME_USINGANDOWNERSHIP_CLASSSCRIPTOWNED_HPP

#include "jsapi.h"
#include <Mix.hpp>

namespace jswrap { namespace ProjectName { namespace UsingAndOwnership { namespace ClassScriptOwned { 
	extern JSObject* jsPrototype;
	extern JSObject* jsConstructor;
	extern JSClass jsClass;
	JSBool init(JSContext* cx, JSObject* scope);
	
	JSObject* wrapCopy(JSContext* cx, const ::UsingAndOwnership::ClassScriptOwned& ref);
	::UsingAndOwnership::ClassScriptOwned* getFromJSValue(JSContext* cx, jsval val);
} } } } 



#endif // JSWRAP_PROJECTNAME_USINGANDOWNERSHIP_CLASSSCRIPTOWNED_HPP