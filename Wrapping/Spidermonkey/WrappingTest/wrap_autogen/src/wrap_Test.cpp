
#include "wrap_Test/SimpleClass.hpp"
#include "wrap_Test.hpp"

namespace jswrap
{

namespace wrap_Test
{
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
			::jswrap::wrap_Test::SimpleClass::init(cx, scope);

		return true;
	}
}

}

