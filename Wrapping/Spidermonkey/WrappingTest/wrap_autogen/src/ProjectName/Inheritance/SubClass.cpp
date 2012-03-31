#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include <Mix.hpp>
#include "ProjectName/Inheritance/BaseClass.hpp"
#include "ProjectName/Inheritance/SubClass.hpp"

namespace jswrap { namespace ProjectName { namespace Inheritance { namespace SubClass { 

	JSObject* jsPrototype = NULL;
	JSObject* jsConstructor = NULL;

	//---------------------------------------------------
	// finalize
	//---------------------------------------------------
	void finalize(JSContext *cx, JSObject *obj)
	{
		::Inheritance::SubClass* inst = static_cast<::Inheritance::SubClass*>(JS_GetPrivate(cx, obj));
		if(inst != NULL)
			delete inst;
	}

	//---------------------------------------------------
	// JSClass
	//---------------------------------------------------
	JSClass jsClass = {
		"SubClass",  /* name */
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
	
	JSBool wrapper_subFunc(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::Inheritance::SubClass* inst = getPrivateAsPtr_NotNull<::Inheritance::SubClass>(cx, JS_THIS(cx, vp), jsConstructor);
			
			inst->subFunc();
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSFunctionSpec instance_functions[] = {
			JS_FS("subFunc", wrapper_subFunc, 0, 0),

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

			if(!JS_SetPrivate(cx, obj, new ::Inheritance::SubClass()))
				throw exception("Could not set private data");
				
			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SubClass")

		return true;
	}

	JSBool init(JSContext* cx, JSObject* scope)
	{ 
		jsPrototype = JS_InitClass(cx, scope, 

			// parent proto
			::jswrap::ProjectName::Inheritance::BaseClass::jsPrototype, 

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
	
	::Inheritance::SubClass* getFromJSValue(JSContext* cx, jsval val)
	{
		return getPrivateAsPtr<::Inheritance::SubClass>(cx, val, jsConstructor);
	}
	
} } } } 

