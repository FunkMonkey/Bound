#ifndef WRAP_HELPERS_CHAR_STRING_X_HPP
#define WRAP_HELPERS_CHAR_STRING_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"

namespace jswrap
{
	// TODO: rename to jsval_to_char_array_strict_x
	/** 
	 * Converts a jsval to a C++ char*
	 *   - throws exception if jsval is not a string
	 *
	 * \param 	val   Value to convert
	 * \return	String as char*
	 */
	static char* jsval_to_char_array_x(JSContext* cx, jsval val)
	{
		if(!JSVAL_IS_STRING(val))
			throw exception("Given jsval is not a JSString");

		char* result = JS_EncodeString(cx, JSVAL_TO_STRING(val));
		if(!result)
			throw exception("Could not convert JSString* to char*");

		return result;
	}

	/** 
	 * Converts a jsval to a C++ char*
	 *   - uses ECMAScript conversion function if jsval is not string
	 *   - throws exception if conversion fails
	 *
	 * \param 	val   Value to convert
	 * \return	String as char*
	 */
	static char* jsval_to_char_array_convert_x(JSContext* cx, jsval val)
	{
		JSString* str = JS_ValueToString(cx, val);

		JS::Anchor<JSString*> a_str(str); // protecting the string from GC

		char* result = JS_EncodeString(cx, str);
		if(!result)
			throw exception("Could not convert jsval to char*");

		return result;
	}

	/** 
	 * Converts a null-terminated char* to a JSString
	 *
	 * \param 	cx           JSContext
	 * \param 	charArray    Character array to convert
	 * \return	JavaScript string
	 */
	static JSString* nullterminated_char_array_to_jsstring_x(JSContext* cx, const char* charArray)
	{
		JSString* result = JS_NewStringCopyZ(cx, charArray);
		if(!result)
			throw exception("Could not convert const char* to JSString* - is it a null-termined char array?");

		return result;
	}

	/** 
	 * Converts a null-terminated char* to a string jsval
	 *
	 * \param 	cx           JSContext
	 * \param 	charArray    Character array to convert
	 * \param 	val          Output jsval
	 */
	static void nullterminated_char_array_to_jsval_x(JSContext* cx, const char* charArray, jsval* val)
	{
		JSString* jsstr = nullterminated_char_array_to_jsstring_x(cx, charArray);
		*val = STRING_TO_JSVAL(jsstr);
	}

	//---------------------------------------------------
	// TEMPLATED
	//---------------------------------------------------

	template<char*>
	char* jsval_to_type_x(JSContext* cx, jsval val)
	{
		return jsval_to_char_array_x(val);
	}

	template<char*>
	char* jsval_to_type_convert_x(JSContext* cx, jsval val)
	{
		return jsval_to_char_array_convert_x(val);
	}
}

#endif // WRAP_HELPERS_CHAR_STRING_X_HPP