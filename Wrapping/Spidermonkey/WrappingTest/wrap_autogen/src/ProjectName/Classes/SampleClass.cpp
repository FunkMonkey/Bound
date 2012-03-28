#include "wrap_helpers/float_x.hpp"
#include "wrap_helpers/int_x.hpp"
#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include <Mix.hpp>
#include "ProjectName/Classes/SampleClass.hpp"

namespace jswrap { namespace ProjectName { namespace Classes { namespace SampleClass { 

	JSObject* jsPrototype = NULL;
	JSObject* jsConstructor = NULL;

	//---------------------------------------------------
	// finalize
	//---------------------------------------------------
	void finalize(JSContext *cx, JSObject *obj)
	{
		::Classes::SampleClass* inst = static_cast<::Classes::SampleClass*>(JS_GetPrivate(cx, obj));
		if(inst != NULL)
			delete inst;
	}

	//---------------------------------------------------
	// JSClass
	//---------------------------------------------------
	JSClass jsClass = {
		"SampleClass",  /* name */
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
	
	JSBool wrapper_memberFunc(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::Classes::SampleClass* inst = getThisPrivatePtr_unsafe<::Classes::SampleClass>(cx, vp);
			
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			double p0__param = jsval_to_double_x(cx, args[0]);
	
			int cpp__result = inst->memberFunc(p0__param);
		
			int_to_jsval_x(cx, cpp__result, &JS_RVAL(cx, vp));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_staticMemberFunc(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::Classes::SampleClass::staticMemberFunc();
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSFunctionSpec instance_functions[] = {
			JS_FS("memberFunc", wrapper_memberFunc, 1, 0),

			JS_FS_END
		};
	
	JSFunctionSpec static_functions[] = {
			JS_FS("staticMemberFunc", wrapper_staticMemberFunc, 0, 0),

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

			if(!JS_SetPrivate(cx, obj, new ::Classes::SampleClass()))
				throw exception("Could not set private data");
				
			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SampleClass")

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
			static_functions);
			
		jsConstructor = JS_GetConstructor(cx, jsPrototype);
			
		return true;
	}
	
	
} } } } 

