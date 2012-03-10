#ifndef USINGSIMPLECLASS_WRAP_HPP
#define USINGSIMPLECLASS_WRAP_HPP

#include "jsapi.h"

namespace jswrap
{
	namespace UsingSimpleClass
	{
		extern JSObject* prototype;
		extern JSClass jsClass;
		JSBool init(JSContext* cx, JSObject* scope);
	}
}

#endif // USINGSIMPLECLASS_WRAP_HPP