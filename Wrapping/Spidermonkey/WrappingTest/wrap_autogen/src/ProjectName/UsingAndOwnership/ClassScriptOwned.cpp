#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include <Mix.hpp>
#include "ProjectName/UsingAndOwnership/ClassScriptOwned.hpp"

namespace jswrap { namespace ProjectName { namespace UsingAndOwnership { namespace ClassScriptOwned { 

	JSObject* jsPrototype = NULL;
	JSObject* jsConstructor = NULL;

	//---------------------------------------------------
	// finalize
	//---------------------------------------------------
	void finalize(JSContext *cx, JSObject *obj)
	{
		::UsingAndOwnership::ClassScriptOwned* inst = static_cast<::UsingAndOwnership::ClassScriptOwned*>(JS_GetPrivate(cx, obj));
		if(inst != NULL)
			delete inst;
	}

	//---------------------------------------------------
	// JSClass
	//---------------------------------------------------
	JSClass jsClass = {
		"ClassScriptOwned",  /* name */
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
		
			::UsingAndOwnership::ClassScriptOwned* inst = getPrivateAsPtr_NotNull<::UsingAndOwnership::ClassScriptOwned>(cx, JS_THIS(cx, vp), jsConstructor);
			
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

			if(!JS_SetPrivate(cx, obj, new ::UsingAndOwnership::ClassScriptOwned()))
				throw exception("Could not set private data");
				
			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "ClassScriptOwned")

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
	
	JSObject* wrapCopy(JSContext* cx, const ::UsingAndOwnership::ClassScriptOwned& ref)
	{
		return jswrap::wrapCopy(cx, ref, &jsClass, jsPrototype);
	}

	::UsingAndOwnership::ClassScriptOwned* getFromJSValue(JSContext* cx, jsval val)
	{
		return getPrivateAsPtr<::UsingAndOwnership::ClassScriptOwned>(cx, val, jsConstructor);
	}
	
} } } } 

