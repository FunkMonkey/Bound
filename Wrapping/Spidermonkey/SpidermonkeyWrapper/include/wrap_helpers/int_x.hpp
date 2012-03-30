#ifndef WRAP_HELPERS_INT_X_HPP
#define WRAP_HELPERS_INT_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"

namespace jswrap
{

	// TODO: rename to jsval_to_int32_strict_x
	/** 
	 * Converts a jsval to a C++ int32
	 *   - throws exception if jsval is not a number conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ int32
	 */
	static int32 jsval_to_int32_x(JSContext* cx, jsval val)
	{
		int32 result;
		if(!JSVAL_IS_NUMBER(val) || !JS_ValueToECMAInt32(cx, val, &result))
			throw exception("Given jsval is not a number");

		return result;
	}

	// TODO: rename to jsval_to_uint32_strict_x
	/** 
	 * Converts a jsval to a C++ unsigned int32
	 *   - throws exception if jsval is not a number conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ uint32
	 */
	static uint32 jsval_to_uint32_x(JSContext* cx, jsval val)
	{
		uint32 result;
		if(!JSVAL_IS_NUMBER(val) || !JS_ValueToECMAUint32(cx, val, &result))
			throw exception("Given jsval is not a number");

		return result;
	}

	// TODO: rename to jsval_to_uint16_strict_x
	/** 
	 * Converts a jsval to a C++ uint16
	 *   - throws exception if jsval is not a number conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ uint16
	 */
	static uint16 jsval_to_uint16_x(JSContext* cx, jsval val)
	{
		uint16 result;
		if(!JSVAL_IS_NUMBER(val) || !JS_ValueToUint16(cx, val, &result))
			throw exception("Given jsval is not a number");

		return result;
	}

	/** 
	 * Converts a jsval to a C++ int32
	 *   - uses ECMAScript conversion function if jsval is not int
	 *   - throws exception if conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ int32
	 */
	static int32 jsval_to_int32_convert_x(JSContext* cx, jsval val)
	{
		  
		int32 result;
		if(!JS_ValueToECMAInt32(cx, val, &result))
			throw exception("Could not convert jsval to int32");

		return result;
	}

	/** 
	 * Converts a jsval to a C++ unsigned int32
	 *   - uses ECMAScript conversion function if jsval is not int
	 *   - throws exception if conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ uint32
	 */
	static uint32 jsval_to_uint32_convert_x(JSContext* cx, jsval val)
	{
		  
		uint32 result;
		if(!JS_ValueToECMAUint32(cx, val, &result))
			throw exception("Could not convert jsval to uint32");

		return result;
	}

	/** 
	 * Converts a jsval to a C++ uint16
	 *   - uses ECMAScript conversion function if jsval is not int
	 *   - throws exception if conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ uint16
	 */
	static uint16 jsval_to_uint16_convert_x(JSContext* cx, jsval val)
	{
		  
		uint16 result;
		if(!JS_ValueToUint16(cx, val, &result))
			throw exception("Could not convert jsval to uint16");

		return result;
	}

	// TODO: rename to jsval_to_wchar_t_strict_x
	/** 
	 * Converts a jsval to a C++ wchar_t
	 *   - throws exception if jsval is not a number conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ wchar_t
	 */
	static wchar_t jsval_to_wchar_t_x(JSContext* cx, jsval val)
	{
		return jsval_to_int32_x(cx, val);
	}

	/** 
	 * Converts a jsval to a C++ wchar_t
	 *   - uses ECMAScript conversion function if jsval is not int
	 *   - throws exception if conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	C++ wchar_t
	 */
	static wchar_t jsval_to_wchar_t_convert_x(JSContext* cx, jsval val)
	{
		return jsval_to_int32_convert_x(cx, val);
	}

	/** 
	 * Converts a int to a number jsval
	 *
	 * \param 	cx           JSContext
	 * \param 	value        int value to convert
	 * \param 	val          Output jsval
	 */
	static void int_to_jsval_x(JSContext* cx, int value, jsval* rval)
	{
		// TODO: we could use INT_FITS_IN_JSVAL here for performance reasons
		if(!JS_NewNumberValue(cx, value, rval))
			throw exception("Could not convert int to jsval");
	}

}

#endif // WRAP_HELPERS_INT_X_HPP