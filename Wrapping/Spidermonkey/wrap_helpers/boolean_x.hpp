#ifndef WRAP_HELPERS_BOOLEAN_X_HPP
#define WRAP_HELPERS_BOOLEAN_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"

namespace jswrap
{
	static bool jsval_to_boolean_x(jsval val)
	{
		if(!JSVAL_IS_BOOLEAN(val))
			throw exception("Given jsval is not a boolean");

		return JSVAL_TO_BOOLEAN(val) != 0;
	}

	static bool jsval_to_boolean_convert_x(JSContext* cx, jsval val)
	{
		JSBool result;
		if(!JS_ValueToBoolean(cx, val, &result))
			throw exception("Could not convert jsval to boolean");

		return result != 0;
	}

}

#endif // WRAP_HELPERS_BOOLEAN_X_HPP