
#include "wrap_helpers/wrap_helpers_x.hpp"
#include "SimpleClass.hpp"
#include "wrap_helpers/private_data_x.hpp"
#include "wrap_Test/SimpleClass.hpp"

namespace jswrap
{
namespace wrap_Test
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
	
	JSBool wrapper_void_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::SimpleClass& inst = getThisPrivateRef<::SimpleClass>(cx, vp);
			
			
			inst.void_param0();
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_static_void_param0(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			
			::SimpleClass::static_void_param0();
		
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}


	
	JSFunctionSpec instance_functions[] = {
			JS_FS("void_param0", wrapper_void_param0, 0, 0),

			JS_FS_END
		};
	
	JSFunctionSpec static_functions[] = {
			JS_FS("static_void_param0", wrapper_static_void_param0, 0, 0),

			JS_FS_END
		};
	

	//---------------------------------------------------
	// Constructor
	//---------------------------------------------------
	JSBool constructor(JSContext *cx, uintN argc, jsval *vp)
	{
		JSObject* obj = JS_NewObject(cx, &jsClass, prototype, NULL);
		if (!obj)
			return false;

		if(!JS_SetPrivate(cx, obj, new ::SimpleClass()))
		{
			// TODO: throw js-exception
		}

		JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));

		return true;
	}

	JSBool init(JSContext* cx, JSObject* scope)
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
			static_functions);
			
		return true;
	}
}
}

}

