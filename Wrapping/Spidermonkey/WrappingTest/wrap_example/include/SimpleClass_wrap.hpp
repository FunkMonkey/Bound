#ifndef SIMPLECLASS_WRAP_HPP
#define SIMPLECLASS_WRAP_HPP

#include "jsapi.h"

class SimpleClass;

namespace jswrap
{
	namespace SimpleClass
	{
		extern JSObject* jsPrototype;
		extern JSObject* jsConstructor;
		extern JSClass   jsClass;
		JSBool init(JSContext* cx, JSObject* scope);

		static bool restriction_supportsNullInstances = false;
		static bool restriction_scriptOwned = true;

		JSObject* wrapInstance(JSContext* cx, const ::SimpleClass* ptr);
		JSObject* wrapCopy(JSContext* cx, const ::SimpleClass& ref);

		::SimpleClass* getFromJSValue(JSContext* cx, jsval val);
	}
}

#endif //SIMPLECLASS_WRAP_HPP