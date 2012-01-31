
#ifndef JSWRAP_WRAP_TEST_SIMPLECLASS_HPP
#define JSWRAP_WRAP_TEST_SIMPLECLASS_HPP

#include "jsapi.h"

namespace jswrap
{
namespace wrap_Test
{
namespace SimpleClass
{
	extern JSObject* prototype;
	extern JSClass jsClass;
	JSBool init(JSContext* cx, JSObject* scope);
}
}

}

#endif // JSWRAP_WRAP_TEST_SIMPLECLASS_HPP