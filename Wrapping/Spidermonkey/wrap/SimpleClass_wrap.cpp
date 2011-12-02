#include "../wrap/SimpleClass_wrap.hpp"

#include "jsapi.h"
#include "wrap_helpers.hpp"
#include "SimpleClass.hpp"
#include <exception>

namespace jswrap
{
	namespace SimpleClass
	{
		JSObject* prototype = NULL;

		//---------------------------------------------------
		// finalize
		//---------------------------------------------------
		void finalize(JSContext *cx, JSObject *obj)
		{
			::SimpleClass* inst = static_cast<::SimpleClass*>(JS_GetPrivate(cx, obj));
			if(inst != NULL)
				delete inst;
		}

		//---------------------------------------------------
		// JSClass
		//---------------------------------------------------
		JSClass jsClass = {
			"SimpleClass",  /* name */
			JSCLASS_HAS_PRIVATE,  /* flags */
			JS_PropertyStub, 
			JS_PropertyStub, 
			JS_PropertyStub, 
			JS_StrictPropertyStub,
			JS_EnumerateStub, 
			JS_ResolveStub, 
			JS_ConvertStub, 
			finalize
		};

		//---------------------------------------------------
		// instance functions
		//---------------------------------------------------
		JSBool voidFunc0(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::SimpleClass& inst = getThisPrivateRef<::SimpleClass>(cx, vp);
			inst.voidFunc0();
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::voidFunc0")

				JS_SET_RVAL(cx, vp, JSVAL_VOID);
			return true;
		}

		JSFunctionSpec instance_functions[] = {
			JS_FS("voidFunc0",   voidFunc0,   0, 0),
			JS_FS_END
		};

		//---------------------------------------------------
		// static functions
		//---------------------------------------------------

		//---------------------------------------------------
		// instance properties
		//---------------------------------------------------

		//---------------------------------------------------
		// static properties
		//---------------------------------------------------






		//---------------------------------------------------
		// Constructor
		//---------------------------------------------------
		JSBool constructor(JSContext *cx, uintN argc, jsval *vp)
		{
			JSObject* obj = JS_NewObject(cx, &jsClass, prototype, NULL);
			if (!obj)
				return false;

			if(!JS_SetPrivate(cx, obj, new ::SimpleClass()))
				int i; // throw js-exception

			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));

			return true;
		}

		//---------------------------------------------------
		// Exposing the functionality
		//---------------------------------------------------
		JSBool initClass(JSContext* cx, JSObject* scope)
		{
			prototype = JS_InitClass(cx, scope, 

				// parent proto
				NULL, 

				&jsClass,

				// native constructor function and min arg count
				constructor, 0,

				// instance properties
				NULL, 

				// instance functions
				instance_functions,

				// static properties
				NULL, 

				// static functions
				NULL);

			return true;
		}
	}
}