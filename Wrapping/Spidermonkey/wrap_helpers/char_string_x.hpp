#ifndef WRAP_HELPERS_CHAR_STRING_X_HPP
#define WRAP_HELPERS_CHAR_STRING_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"

namespace jswrap
{
	static char* jsval_to_char_array_x(JSContext* cx, jsval val)
	{
		if(!JSVAL_IS_STRING(val))
			throw exception("Given jsval is not a JSString");

		char* result = JS_EncodeString(cx, JSVAL_TO_STRING(val));
		if(!result)
			throw exception("Could not convert JSString* to char*");

		return result;
	}

	static char* jsval_to_char_array_convert_x(JSContext* cx, jsval val)
	{
		JSString* str = JS_ValueToString(cx, val);

		JS::Anchor<JSString*> a_str(str); // protecting the string from GC

		char* result = JS_EncodeString(cx, str);
		if(!result)
			throw exception("Could not convert jsval to char*");

		return result;
	}

	static JSString* nullterminated_char_array_to_jsstring_x(JSContext* cx, const char* charArray)
	{
		JSString* result = JS_NewStringCopyZ(cx, charArray);
		if(!result)
			throw exception("Could not convert const char* to JSString* - is it a null-termined char array?");

		return result;
	}

	static void nullterminated_char_array_to_jsval_x(JSContext* cx, const char* charArray, jsval* val)
	{
		JSString* jsstr = nullterminated_char_array_to_jsstring_x(cx, charArray);
		*val = STRING_TO_JSVAL(jsstr);
	}
}

#endif // WRAP_HELPERS_CHAR_STRING_X_HPP