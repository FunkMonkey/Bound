#ifndef SIMPLECLASS_WRAP_HPP
#define SIMPLECLASS_WRAP_HPP

#include "jsapi.h"
#include "SimpleClass.hpp"


namespace jswrap
{
	namespace SimpleClass
	{
		JSBool voidFunc0(JSContext *cx, uintN argc, jsval *vp)
		{
			//JS_SET_RVAL(cx, vp, DOUBLE_TO_JSVAL(rand()));
			return true;
		}

		static JSObject* prototype;

		static JSFunctionSpec instance_functions[] = {
			JS_FS("voidFunc0",   voidFunc0,   0, 0),
			JS_FS_END
		};

		static JSClass jsClass = {
			"SimpleClass",  /* name */
			JSCLASS_HAS_PRIVATE,  /* flags */
			JS_PropertyStub, 
			JS_PropertyStub, 
			JS_PropertyStub, 
			JS_StrictPropertyStub,
			JS_EnumerateStub, 
			JS_ResolveStub, 
			JS_ConvertStub, 
			JS_FinalizeStub
		};

		JSBool constructor(JSContext *cx, uintN argc, jsval *vp)
		{
			JSObject* obj = JS_NewObject(cx, &jsClass, prototype, NULL);
			if (!obj)
				return false;

			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));

			return true;
		}

		

		JSBool initClass(JSContext* cx, JSObject* globalObj)
		{
			prototype = JS_InitClass(cx, globalObj, 
				
						/* parent proto */
						NULL, 
				
						&jsClass,

                        /* native constructor function and min arg count */
                        constructor, 0,

                        /* prototype object properties and methods -- these
                           will be "inherited" by all instances through
                           delegation up the instance's prototype link. */
                        NULL, NULL,

                        /* class constructor properties and methods */
                        NULL, NULL);

			return true;
		}
	}
}

#endif //SIMPLECLASS_WRAP_HPP