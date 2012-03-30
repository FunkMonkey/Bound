#ifndef JSWRAP_PROJECTNAME_CLASSES_SAMPLECLASS_HPP
#define JSWRAP_PROJECTNAME_CLASSES_SAMPLECLASS_HPP

#include "jsapi.h"
#include <Mix.hpp>

namespace jswrap { namespace ProjectName { namespace Classes { namespace SampleClass { 
	extern JSObject* jsPrototype;
	extern JSObject* jsConstructor;
	extern JSClass jsClass;
	JSBool init(JSContext* cx, JSObject* scope);
	
	::Classes::SampleClass* getFromJSValue(JSContext* cx, jsval val);
} } } } 



#endif // JSWRAP_PROJECTNAME_CLASSES_SAMPLECLASS_HPP