#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include <Mix.hpp>
#include "ProjectName/UsingAndOwnership/ClassNativeOwned.hpp"

namespace jswrap { namespace ProjectName { namespace UsingAndOwnership { namespace ClassNativeOwned { 

	JSObject* jsPrototype = NULL;
	JSObject* jsConstructor = NULL;

	//---------------------------------------------------
	// finalize
	//---------------------------------------------------
	void finalize(JSContext *cx, JSObject *obj)
	{
		::UsingAndOwnership::ClassNativeOwned* inst = static_cast<::UsingAndOwnership::ClassNativeOwned*>(JS_GetPrivate(cx, obj));
	}

	//---------------------------------------------------
	// JSClass
	//---------------------------------------------------
	JSClass jsClass = {
		"ClassNativeOwned",  /* name */
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
	
	JSBool wrapper_func(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingAndOwnership::ClassNativeOwned* inst = getPrivateAsPtr_NotNull<::UsingAndOwnership::ClassNativeOwned>(cx, JS_THIS(cx, vp), jsConstructor);
			
			inst->func();
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSFunctionSpec instance_functions[] = {
			JS_FS("func", wrapper_func, 0, 0),

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

			if(!JS_SetPrivate(cx, obj, new ::UsingAndOwnership::ClassNativeOwned()))
				throw exception("Could not set private data");
				
			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "ClassNativeOwned")

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
	
	JSObject* wrapInstance(JSContext* cx, const ::UsingAndOwnership::ClassNativeOwned* ptr)
	{
		if(!ptr)
			throw exception("::UsingAndOwnership::ClassNativeOwned: wrapper does not support null values");

		return jswrap::wrapPtr(cx, ptr, &jsClass, jsPrototype);
	}

	::UsingAndOwnership::ClassNativeOwned* getFromJSValue(JSContext* cx, jsval val)
	{
		return getPrivateAsPtr<::UsingAndOwnership::ClassNativeOwned>(cx, val, jsConstructor);
	}
	
} } } } 

