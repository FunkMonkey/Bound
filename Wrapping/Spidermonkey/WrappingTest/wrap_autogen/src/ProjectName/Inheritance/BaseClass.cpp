#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include <Mix.hpp>
#include "ProjectName/Inheritance/BaseClass.hpp"

namespace jswrap { namespace ProjectName { namespace Inheritance { namespace BaseClass { 

	JSObject* jsPrototype = NULL;
	JSObject* jsConstructor = NULL;

	//---------------------------------------------------
	// finalize
	//---------------------------------------------------
	void finalize(JSContext *cx, JSObject *obj)
	{
		::Inheritance::BaseClass* inst = static_cast<::Inheritance::BaseClass*>(JS_GetPrivate(cx, obj));
		if(inst != NULL)
			delete inst;
	}

	//---------------------------------------------------
	// JSClass
	//---------------------------------------------------
	JSClass jsClass = {
		"BaseClass",  /* name */
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
	
	JSBool wrapper_baseFunc(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::Inheritance::BaseClass* inst = getPrivateAsPtr_NotNull<::Inheritance::BaseClass>(cx, JS_THIS(cx, vp), jsConstructor);
			
			inst->baseFunc();
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSFunctionSpec instance_functions[] = {
			JS_FS("baseFunc", wrapper_baseFunc, 0, 0),

			JS_FS_END
		};
	

	//---------------------------------------------------
	// Constructor
	//---------------------------------------------------
	JSBool constructor(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
			JSObject* obj = JS_NewObject(cx, &jsClass, jsPrototype, NULL);
			if (!obj)
				return false;

			if(!JS_SetPrivate(cx, obj, new ::Inheritance::BaseClass()))
				throw exception("Could not set private data");
				
			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "BaseClass")

		return true;
	}

	JSBool init(JSContext* cx, JSObject* scope)
	{ 
		jsPrototype = JS_InitClass(cx, scope, 

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
			
		jsConstructor = JS_GetConstructor(cx, jsPrototype);
			
		return true;
	}
	
	::Inheritance::BaseClass* getFromJSValue(JSContext* cx, jsval val)
	{
		return getPrivateAsPtr<::Inheritance::BaseClass>(cx, val, jsConstructor);
	}
	
} } } } 

