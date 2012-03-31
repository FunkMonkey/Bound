#include "ProjectName/Inheritance/BaseClass.hpp"
#include "ProjectName/Inheritance/SubClass.hpp"
#include "ProjectName/Inheritance.hpp"

namespace jswrap { namespace ProjectName { namespace Inheritance { 
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
		JSObject* newObj = JS_DefineObject(cx, scope, "Inheritance", NULL, NULL, 0);
		if(!newObj)
			return false;
			
		::jswrap::ProjectName::Inheritance::BaseClass::init(cx, newObj);
		::jswrap::ProjectName::Inheritance::SubClass::init(cx, newObj);

		return true;
	}
	
} } } 

