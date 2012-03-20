#ifndef WRAP_HELPERS_STRING_X_HPP
#define WRAP_HELPERS_STRING_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"
#include "char_string_x.hpp"

#include <string>

namespace jswrap
{
	static std::string jsval_to_stdString_x(JSContext* cx, jsval val)
	{
		if(!JSVAL_IS_STRING(val))
			throw exception("Given jsval is not a JSString");

		char* result = JS_EncodeString(cx, JSVAL_TO_STRING(val));
		if(!result)
			throw exception("Could not convert JSString* to char*");

		std::string strRes(result);
		delete[] result;

		return strRes; // TODO: optimize
	}

	static std::string jsval_to_stdString_convert_x(JSContext* cx, jsval val)
	{
		JSString* str = JS_ValueToString(cx, val);
		if(!str)
			throw exception("Could not convert jsval to char*");

		JS::Anchor<JSString*> a_str(str); // protecting the string from GC

		char* result = JS_EncodeString(cx, str);
		if(!result)
			throw exception("Could not convert jsval to char*");

		std::string strRes(result);
		delete[] result;

		return strRes; // TODO: optimize
	}

	static JSString* stdString_to_jsstring_x(JSContext* cx, const std::string& str)
	{
		JSString* result = JS_NewStringCopyZ(cx, str.c_str());
		if(!result)
			throw exception("Could not convert std::string to JSString*");

		return result;
	}

	static void stdString_to_jsval_x(JSContext* cx, const std::string& str, jsval* val)
	{
		JSString* jsstr = stdString_to_jsstring_x(cx, str);
		*val = STRING_TO_JSVAL(jsstr);
	}

}

#endif // WRAP_HELPERS_STRING_X_HPP