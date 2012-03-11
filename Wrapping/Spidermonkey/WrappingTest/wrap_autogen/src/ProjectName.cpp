#include "ProjectName/SimpleClass.hpp"
#include "ProjectName/UsingSimpleClass.hpp"
#include "ProjectName.hpp"

namespace jswrap { namespace ProjectName { 
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
			::jswrap::ProjectName::SimpleClass::init(cx, scope);
		::jswrap::ProjectName::UsingSimpleClass::init(cx, scope);

		return true;
	}
	
} } 

