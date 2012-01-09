#ifndef CONVERSION_TEMPLATES_HPP
#define CONVERSION_TEMPLATES_HPP

#include <jsapi.h>

namespace jswrap
{
	
	template<typename T>
	T jsval_to_type_x(JSContext* cx, jsval val)
	{
		static_assert(false, "Conversion not implemented!");
	}

	template<typename T>
	T jsval_to_type_convert_x(JSContext* cx, jsval val)
	{
		static_assert(false, "Conversion not implemented!");
	}

}

#endif // CONVERSION_TEMPLATES_HPP