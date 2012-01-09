#ifndef GLOBAL_FUNCTIONS_HPP
#define GLOBAL_FUNCTIONS_HPP

#include "jsapi.h"

namespace jswrap
{
	namespace GlobalFunctions
	{
		JSBool init(JSContext* cx, JSObject* scope);
	}
}


#endif // GLOBAL_FUNCTIONS_HPP