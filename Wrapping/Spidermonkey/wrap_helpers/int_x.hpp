#ifndef WRAP_HELPERS_INT_X_HPP
#define WRAP_HELPERS_INT_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"

namespace jswrap
{
	static int32 jsval_to_int32_x(JSContext* cx, jsval val)
	{
		int32 result;
		if(!JSVAL_IS_NUMBER(val) || !JS_ValueToECMAInt32(cx, val, &result))
			throw exception("Given jsval is not a number");

		return result;
	}

	static uint32 jsval_to_uint32_x(JSContext* cx, jsval val)
	{
		uint32 result;
		if(!JSVAL_IS_NUMBER(val) || !JS_ValueToECMAUint32(cx, val, &result))
			throw exception("Given jsval is not a number");

		return result;
	}

	static uint16 jsval_to_uint16_x(JSContext* cx, jsval val)
	{
		uint16 result;
		if(!JSVAL_IS_NUMBER(val) || !JS_ValueToUint16(cx, val, &result))
			throw exception("Given jsval is not a number");

		return result;
	}

	static int32 jsval_to_int32_convert_x(JSContext* cx, jsval val)
	{
		  
		int32 result;
		if(!JS_ValueToECMAInt32(cx, val, &result))
			throw exception("Could not convert jsval to int32");

		return result;
	}

	static uint32 jsval_to_uint32_convert_x(JSContext* cx, jsval val)
	{
		  
		uint32 result;
		if(!JS_ValueToECMAUint32(cx, val, &result))
			throw exception("Could not convert jsval to uint32");

		return result;
	}

	static uint16 jsval_to_uint16_convert_x(JSContext* cx, jsval val)
	{
		  
		uint16 result;
		if(!JS_ValueToUint16(cx, val, &result))
			throw exception("Could not convert jsval to uint16");

		return result;
	}

	static wchar_t jsval_to_wchar_t_x(JSContext* cx, jsval val)
	{
		return jsval_to_int32_x(cx, val);
	}

	static wchar_t jsval_to_wchar_t_convert_x(JSContext* cx, jsval val)
	{
		return jsval_to_int32_convert_x(cx, val);
	}

	static void int_to_jsval_x(JSContext* cx, int value, jsval* rval)
	{
		// TODO: we could use INT_FITS_IN_JSVAL here for performance reasons
		if(!JS_NewNumberValue(cx, value, rval))
			throw exception("Could not convert int to jsval");
	}

}

#endif // WRAP_HELPERS_INT_X_HPP