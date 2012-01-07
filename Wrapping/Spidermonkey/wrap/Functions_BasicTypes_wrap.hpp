#ifndef FUNCTIONS_BASICTYPES_WRAP_HPP
#define FUNCTIONS_BASICTYPES_WRAP_HPP

#include "jsapi.h"

namespace jswrap
{
	namespace Functions_BasicTypes
	{
		JSBool init(JSContext* cx, JSObject* scope);
	}
}

#endif //FUNCTIONS_BASICTYPES_WRAP_HPP