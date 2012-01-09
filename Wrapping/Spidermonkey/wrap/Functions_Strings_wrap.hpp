#ifndef FUNCTIONS_STRINGS_WRAP_HPP
#define FUNCTIONS_STRINGS_WRAP_HPP

#include "jsapi.h"

namespace jswrap
{
	namespace Functions_Strings
	{
		JSBool init(JSContext* cx, JSObject* scope);
	}
}

#endif //FUNCTIONS_STRINGS_WRAP_HPP