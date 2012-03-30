#ifndef WRAP_HELPERS_BOOLEAN_X_HPP
#define WRAP_HELPERS_BOOLEAN_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"
#include "conversion_templates.hpp"

namespace jswrap
{
	// TODO: rename to jsval_to_boolean_strict_x
	/** 
	 * Converts a jsval to a C++ boolean
	 *   - throws exception if jsval is not a boolean
	 *
	 * \param 	val   Value to convert
	 * \return	C++ boolean
	 */
	static bool jsval_to_boolean_x(jsval val)
	{
		if(!JSVAL_IS_BOOLEAN(val))
			throw exception("Given jsval is not a boolean");

		return JSVAL_TO_BOOLEAN(val) != 0;
	}

	/** 
	 * Converts a jsval to a C++ boolean
	 *   - uses ECMAScript conversion function if jsval is not boolean
	 *   - throws exception if conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ boolean
	 */
	static bool jsval_to_boolean_convert_x(JSContext* cx, jsval val)
	{
		JSBool result;
		if(!JS_ValueToBoolean(cx, val, &result))
			throw exception("Could not convert jsval to boolean");

		return result != 0;
	}

	//---------------------------------------------------
	// TEMPLATED
	//---------------------------------------------------

	//template<>
	//bool jsval_to_type_x(JSContext* cx, jsval val)
	//{
	//	return jsval_to_boolean_x(val);
	//}

	//template<>
	//bool jsval_to_type_convert_x(JSContext* cx, jsval val)
	//{
	//	return jsval_to_boolean_convert_x(cx, val);
	//}

}

#endif // WRAP_HELPERS_BOOLEAN_X_HPP