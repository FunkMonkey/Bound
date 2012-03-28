#include "ProjectName/Classes/SampleClass.hpp"
#include "ProjectName/Classes.hpp"

namespace jswrap { namespace ProjectName { namespace Classes { 
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
		JSObject* newObj = JS_DefineObject(cx, scope, "Classes", NULL, NULL, 0);
		if(!newObj)
			return false;
			
		::jswrap::ProjectName::Classes::SampleClass::init(cx, newObj);

		return true;
	}
	
} } } 

