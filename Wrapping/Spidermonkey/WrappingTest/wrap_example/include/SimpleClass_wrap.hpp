#ifndef SIMPLECLASS_WRAP_HPP
#define SIMPLECLASS_WRAP_HPP

#include "jsapi.h"

namespace jswrap
{
	namespace SimpleClass
	{
		extern JSObject* prototype;
		extern JSClass jsClass;
		JSBool init(JSContext* cx, JSObject* scope);
	}
}

#endif //SIMPLECLASS_WRAP_HPP