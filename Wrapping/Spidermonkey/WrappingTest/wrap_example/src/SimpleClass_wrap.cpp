#include "SimpleClass_wrap.hpp"
#include "SimpleClass.hpp"

#include "wrap_helpers/private_data_x.hpp"
#include "wrap_helpers/int_x.hpp"
#include "wrap_helpers/float_x.hpp"

#include <iostream>

namespace jswrap
{
	namespace SimpleClass
	{
		JSObject* jsPrototype = NULL;
		JSObject* jsConstructor = NULL;

		//---------------------------------------------------
		// finalize
		//---------------------------------------------------
		void finalize(JSContext *cx, JSObject *obj)
		{
			::SimpleClass* inst = static_cast<::SimpleClass*>(JS_GetPrivate(cx, obj));
			if(inst != NULL && restriction_scriptOwned)
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
		JSBool void_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::SimpleClass* inst = getThisPrivatePtr_unsafe<::SimpleClass>(cx, vp);
				inst->void_param0();
				JS_SET_RVAL(cx, vp, JSVAL_VOID);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::void_param0")

			return true;
		}

		JSFunctionSpec instance_functions[] = {
			JS_FS("void_param0",   void_param0_wrap,   0, 0),
			JS_FS_END
		};

		//---------------------------------------------------
		// static functions
		//---------------------------------------------------
		JSBool static_void_param0_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::SimpleClass::static_void_param0();
				JS_SET_RVAL(cx, vp, JSVAL_VOID);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::static_void_param0")

			return true;
		}

		JSFunctionSpec static_functions[] = {
			JS_FS("static_void_param0",   static_void_param0_wrap,   0, 0),
			JS_FS_END
		};

		//---------------------------------------------------
		// instance properties
		//---------------------------------------------------

		JSBool intProp_getter_wrap(JSContext* cx, JSObject* obj, jsid id, jsval* vp)
		{
			JSWRAP_TRY_START
				::SimpleClass* inst = getPrivateAsPtr_unsafe<::SimpleClass>(cx, obj);
				int cppResult = inst->getIntProp();
				int_to_jsval_x(cx, cppResult, vp);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::intProp")

			return true;
		}

		JSBool intProp_setter_wrap(JSContext* cx, JSObject* obj, jsid id, JSBool strict, jsval* vp)
		{
			JSWRAP_TRY_START
				::SimpleClass* inst = getPrivateAsPtr_unsafe<::SimpleClass>(cx, obj);
				int val = jsval_to_int32_x(cx, *vp);
				inst->setIntProp(val);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::intProp")

			return true;
		}

		JSBool floatPropField_getter_wrap(JSContext* cx, JSObject* obj, jsid id, jsval* vp)
		{
			JSWRAP_TRY_START
				::SimpleClass* inst = getPrivateAsPtr_unsafe<::SimpleClass>(cx, obj);
				double_to_jsval_x(cx, inst->floatPropField, vp);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::floatProp")

			return true;
		}

		JSBool floatPropField_setter_wrap(JSContext* cx, JSObject* obj, jsid id, JSBool strict, jsval* vp)
		{
			JSWRAP_TRY_START
				::SimpleClass* inst = getPrivateAsPtr_unsafe<::SimpleClass>(cx, obj);
				inst->floatPropField = (float)jsval_to_double_x(cx, *vp);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::floatProp")

			return true;
		}

		JSPropertySpec instance_properties[] = {
			{ "floatPropField", 0, JSPROP_SHARED | JSPROP_ENUMERATE, floatPropField_getter_wrap, floatPropField_setter_wrap },
			{ "intProp", 0,        JSPROP_SHARED | JSPROP_ENUMERATE, intProp_getter_wrap,        intProp_setter_wrap },
			
			{ 0, 0, 0, NULL, NULL }
		};

		//---------------------------------------------------
		// static properties
		//---------------------------------------------------

		JSBool staticIntProp_getter_wrap(JSContext* cx, JSObject* obj, jsid id, jsval* vp)
		{
			JSWRAP_TRY_START
				int cppResult = ::SimpleClass::getStaticIntProp();
				int_to_jsval_x(cx, cppResult, vp);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::intProp")

			return true;
		}

		JSBool staticIntProp_setter_wrap(JSContext* cx, JSObject* obj, jsid id, JSBool strict, jsval* vp)
		{
			JSWRAP_TRY_START
				int val = jsval_to_int32_x(cx, *vp);
				::SimpleClass::setStaticIntProp(val);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::intProp")

			return true;
		}

		JSBool staticFloatPropField_getter_wrap(JSContext* cx, JSObject* obj, jsid id, jsval* vp)
		{
			JSWRAP_TRY_START
				double_to_jsval_x(cx, ::SimpleClass::staticFloatPropField, vp);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::floatProp")

			return true;
		}

		JSBool staticFloatPropField_setter_wrap(JSContext* cx, JSObject* obj, jsid id, JSBool strict, jsval* vp)
		{
			JSWRAP_TRY_START
				::SimpleClass::staticFloatPropField = (float)jsval_to_double_x(cx, *vp);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass::floatProp")

			return true;
		}

		JSPropertySpec static_properties[] = {
			{ "staticIntProp",        0, JSPROP_SHARED | JSPROP_ENUMERATE, staticIntProp_getter_wrap,        staticIntProp_setter_wrap },
			{ "staticFloatPropField", 0, JSPROP_SHARED | JSPROP_ENUMERATE, staticFloatPropField_getter_wrap, staticFloatPropField_setter_wrap },
			{ 0, 0, 0, NULL, NULL }
		};

		//---------------------------------------------------
		// Constructor
		//---------------------------------------------------
		JSBool constructor_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				if(!restriction_scriptOwned)
					throw exception("Cannot construct instances of ::SimpleClass");
				
				JSObject* obj = JS_NewObject(cx, &jsClass, jsPrototype, NULL);
				if (!obj)
					return false;

				if(!JS_SetPrivate(cx, obj, new ::SimpleClass()))
				{
					throw exception("Could not set private data");
				}

				JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "SimpleClass")

			return true;
		}

		//---------------------------------------------------
		// Exposing the functionality
		//---------------------------------------------------
		JSBool init(JSContext* cx, JSObject* scope)
		{
			jsPrototype = JS_InitClass(cx, scope, 

				// parent proto
				NULL, 

				&jsClass,

				// native constructor function and min arg count
				constructor_wrap, 0,

				// instance properties
				instance_properties, 

				// instance functions
				instance_functions,

				// static properties
				static_properties, 

				// static functions
				static_functions);

			jsConstructor = JS_GetConstructor(cx, jsPrototype);

			return true;
		}

		JSObject* wrapInstance(JSContext* cx, const ::SimpleClass* ptr)
		{
			if(!ptr && !restriction_supportsNullInstances)
				throw exception("::SimpleClass: wrapper does not support null values");

			return jswrap::wrapPtr(cx, ptr, &jsClass, jsPrototype);
		}

		JSObject* wrapCopy(JSContext* cx, const ::SimpleClass& ref)
		{
			if(!restriction_scriptOwned)
				throw exception("::SimpleClass: wrapper does not support copies");

			return jswrap::wrapCopy(cx, ref, &jsClass, jsPrototype);
		}

		::SimpleClass* getFromJSValue(JSContext* cx, jsval val)
		{
			::SimpleClass* instance = getPrivateAsPtr<::SimpleClass>(cx, val, jsConstructor);
			if(!instance && !restriction_supportsNullInstances)
				throw exception("::SimpleClass: wrapper does not support null values");

			return instance;
		}

	}
}