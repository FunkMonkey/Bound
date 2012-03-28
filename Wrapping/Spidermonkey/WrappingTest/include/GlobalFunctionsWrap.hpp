#ifndef JSWRAP_GLOBALFUNCTIONSWRAP_HPP
#define JSWRAP_GLOBALFUNCTIONSWRAP_HPP

#include "jsapi.h"

namespace jswrap { namespace GlobalFunctionsWrap { 
	JSBool init(JSContext* cx, JSObject* scope);
} } 



#endif // JSWRAP_GLOBALFUNCTIONSWRAP_HPP