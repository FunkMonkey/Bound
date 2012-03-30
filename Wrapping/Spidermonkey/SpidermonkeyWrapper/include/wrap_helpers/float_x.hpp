#ifndef WRAP_HELPERS_FLOAT_X_HPP
#define WRAP_HELPERS_FLOAT_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"

#include "conversion_templates.hpp"

namespace jswrap
{
	// TODO: rename to jsval_to_double_strict_x
	/** 
	 * Converts a jsval to a C++ double
	 *   - throws exception if jsval is not a double
	 *
	 * \param 	val   Value to convert
	 * \return	C++ double
	 */
	static double jsval_to_double_x(JSContext* cx, jsval val)
	{
		if(JSVAL_IS_DOUBLE(val))
			return JSVAL_TO_DOUBLE(val);

		double result;
		if(!JSVAL_IS_NUMBER(val) || !JS_ValueToNumber(cx, val, &result))
			throw exception("Given jsval is not a number");

		return result;
	}

	/** 
	 * Converts a jsval to a C++ double
	 *   - uses ECMAScript conversion function if jsval is not double
	 *   - throws exception if conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ double
	 */
	static double jsval_to_double_convert_x(JSContext* cx, jsval val)
	{
		double result;
		if(!JS_ValueToNumber(cx, val, &result))
			throw exception("Could not convert jsval to double");

		return result;
	}

	/** 
	 * Converts a double to a number jsval
	 *
	 * \param 	cx           JSContext
	 * \param 	value        double value to convert
	 * \param 	val          Output jsval
	 */
	static void double_to_jsval_x(JSContext* cx, double value, jsval* rval)
	{
		if(!JS_NewNumberValue(cx, value, rval))
			throw exception("Could not convert double to jsval");
	}

	//---------------------------------------------------
	// TEMPLATED
	//---------------------------------------------------

	//template<>
	//double jsval_to_type_x(JSContext* cx, jsval val)
	//{
	//	return jsval_to_double_x(cx, val);
	//}

	//template<>
	//double jsval_to_type_convert_x(JSContext* cx, jsval val)
	//{
	//	return jsval_to_double_convert_x(cx, val);
	//}

}

#endif // WRAP_HELPERS_FLOAT_X_HPP