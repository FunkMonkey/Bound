#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include "ProjectName/SimpleClass.hpp"
#include <UsingSimpleClass.hpp>
#include "ProjectName/UsingSimpleClass.hpp"

namespace jswrap { namespace ProjectName { namespace UsingSimpleClass { 

	JSObject* jsPrototype = NULL;
	JSObject* jsConstructor = NULL;

	//---------------------------------------------------
	// finalize
	//---------------------------------------------------
	void finalize(JSContext *cx, JSObject *obj)
	{
		::UsingSimpleClass* inst = static_cast<::UsingSimpleClass*>(JS_GetPrivate(cx, obj));
		if(inst != NULL)
			delete inst;
	}

	//---------------------------------------------------
	// JSClass
	//---------------------------------------------------
	JSClass jsClass = {
		"UsingSimpleClass",  /* name */
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
	
	JSBool wrapper_passCopy(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
			
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::SimpleClass& p0__copy = *::jswrap::ProjectName::SimpleClass::getFromJSValue(cx, args[0]);
	
			inst->passCopy(p0__copy);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_passRef(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
			
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::SimpleClass & p0__ref = *::jswrap::ProjectName::SimpleClass::getFromJSValue(cx, args[0]);
	
			inst->passRef(p0__ref);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_passPtr(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
			
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::SimpleClass * p0__ptr = ::jswrap::ProjectName::SimpleClass::getFromJSValue(cx, args[0]);
	
			inst->passPtr(p0__ptr);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_returnCopy(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
			
			::SimpleClass& cpp__result = inst->returnCopy();
		
			JS_RVAL(cx, vp) = OBJECT_TO_JSVAL(::jswrap::ProjectName::SimpleClass::wrapCopy(cx, cpp__result));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_returnRef(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
			
			::SimpleClass & cpp__result = inst->returnRef();
		
			JS_RVAL(cx, vp) = OBJECT_TO_JSVAL(::jswrap::ProjectName::SimpleClass::wrapInstance(cx, &cpp__result));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_returnPtr(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
			
			::SimpleClass * cpp__result = inst->returnPtr();
		
			JS_RVAL(cx, vp) = OBJECT_TO_JSVAL(::jswrap::ProjectName::SimpleClass::wrapInstance(cx, cpp__result));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_returnNull(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
			
			::SimpleClass * cpp__result = inst->returnNull();
		
			JS_RVAL(cx, vp) = OBJECT_TO_JSVAL(::jswrap::ProjectName::SimpleClass::wrapInstance(cx, cpp__result));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSFunctionSpec instance_functions[] = {
			JS_FS("passCopy", wrapper_passCopy, 1, 0),
			JS_FS("passRef", wrapper_passRef, 1, 0),
			JS_FS("passPtr", wrapper_passPtr, 1, 0),
			JS_FS("returnCopy", wrapper_returnCopy, 0, 0),
			JS_FS("returnRef", wrapper_returnRef, 0, 0),
			JS_FS("returnPtr", wrapper_returnPtr, 0, 0),
			JS_FS("returnNull", wrapper_returnNull, 0, 0),

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

			if(!JS_SetPrivate(cx, obj, new ::UsingSimpleClass()))
				throw exception("Could not set private data");
				
			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass")

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
	
	
} } } 

