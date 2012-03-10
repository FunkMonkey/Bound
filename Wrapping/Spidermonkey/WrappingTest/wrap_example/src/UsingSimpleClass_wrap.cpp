#include "UsingSimpleClass_wrap.hpp"
#include "UsingSimpleClass.hpp"

#include "SimpleClass_wrap.hpp"

#include "wrap_helpers/private_data_x.hpp"
#include "wrap_helpers/int_x.hpp"
#include "wrap_helpers/float_x.hpp"



namespace jswrap
{
	namespace UsingSimpleClass
	{
		JSObject* prototype = NULL;

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

		//---------------------------------------------------
		// instance functions
		//---------------------------------------------------
		JSBool passCopy_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);

				jsval* args = JS_ARGV(cx, vp);
				::SimpleClass& p0_copy = *::jswrap::SimpleClass::getFromJSValue(cx, args[0]);
				inst->passCopy(p0_copy);
			JS_SET_RVAL(cx, vp, JSVAL_VOID);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::passCopy")

			return true;
		}

		JSBool passRef_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);

				jsval* args = JS_ARGV(cx, vp);
				::SimpleClass& p0_ref = *::jswrap::SimpleClass::getFromJSValue(cx, args[0]);
				inst->passRef(p0_ref);
				JS_SET_RVAL(cx, vp, JSVAL_VOID);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::passRef")

			return true;
		}

		JSBool passPtr_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);

				jsval* args = JS_ARGV(cx, vp);
				::SimpleClass* p0_ptr = ::jswrap::SimpleClass::getFromJSValue(cx, args[0]);
				inst->passPtr(p0_ptr);
				JS_SET_RVAL(cx, vp, JSVAL_VOID);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::passPtr")

			return true;
		}

		JSBool returnRef_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
				::SimpleClass& cpp__result = inst->returnRef();
				JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(::jswrap::SimpleClass::wrapInstance(cx, &cpp__result)));
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::returnRef")

			return true;
		}

		JSBool returnCopy_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
				::SimpleClass cpp__result = inst->returnCopy();
			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(::jswrap::SimpleClass::wrapCopy(cx, cpp__result)));
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::returnCopy")

			return true;
		}
		
		JSBool returnPtr_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
				::SimpleClass* cpp__result = inst->returnPtr();
				JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(::jswrap::SimpleClass::wrapInstance(cx, cpp__result)));
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::returnPtr")

			return true;
		}

		JSBool returnNull_wrap(JSContext *cx, uintN argc, jsval *vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getThisPrivatePtr_unsafe<::UsingSimpleClass>(cx, vp);
				::SimpleClass* cpp__result = inst->returnNull();
				JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(::jswrap::SimpleClass::wrapInstance(cx, cpp__result)));
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::returnNull")

			return true;
		}

		JSFunctionSpec instance_functions[] = {
			
			JS_FS("passCopy",   passCopy_wrap,   1, 0),
			JS_FS("passRef",   passRef_wrap,   1, 0),
			JS_FS("passPtr",   passPtr_wrap,   1, 0),
			JS_FS("returnRef",   returnRef_wrap,   0, 0),
			JS_FS("returnCopy",   returnCopy_wrap,   0, 0),
			JS_FS("returnPtr",   returnPtr_wrap,   0, 0),
			JS_FS("returnNull",   returnNull_wrap,   0, 0),
			JS_FS_END
		};

		//---------------------------------------------------
		// instance properties
		//---------------------------------------------------

		JSBool prop_getter_wrap(JSContext* cx, JSObject* obj, jsid id, jsval* vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getPrivateAsPtr_unsafe<::UsingSimpleClass>(cx, obj);
				::SimpleClass& cpp__result = inst->getProp();
				*vp = OBJECT_TO_JSVAL(::jswrap::SimpleClass::wrapInstance(cx, &cpp__result));
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::prop")

			return true;
		}

		JSBool prop_setter_wrap(JSContext* cx, JSObject* obj, jsid id, JSBool strict, jsval* vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getPrivateAsPtr_unsafe<::UsingSimpleClass>(cx, obj);
				const ::SimpleClass& p0_ref = *::jswrap::SimpleClass::getFromJSValue(cx, *vp);
				inst->setProp(p0_ref);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::prop")

			return true;
		}

		JSBool ptrProp_getter_wrap(JSContext* cx, JSObject* obj, jsid id, jsval* vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getPrivateAsPtr_unsafe<::UsingSimpleClass>(cx, obj);
				::SimpleClass* cpp__result = inst->getPtrProp();
				*vp = OBJECT_TO_JSVAL(::jswrap::SimpleClass::wrapInstance(cx, cpp__result));
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::ptrProp")

				return true;
		}

		JSBool ptrProp_setter_wrap(JSContext* cx, JSObject* obj, jsid id, JSBool strict, jsval* vp)
		{
			JSWRAP_TRY_START
				::UsingSimpleClass* inst = getPrivateAsPtr_unsafe<::UsingSimpleClass>(cx, obj);
				::SimpleClass* p0_ptr = ::jswrap::SimpleClass::getFromJSValue(cx, *vp);
				inst->setPtrProp(p0_ptr);
			JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "UsingSimpleClass::ptrProp")

				return true;
		}


		JSPropertySpec instance_properties[] = {
			{ "prop", 0,        JSPROP_SHARED | JSPROP_ENUMERATE, prop_getter_wrap,        prop_setter_wrap },
			{ "ptrProp", 0,        JSPROP_SHARED | JSPROP_ENUMERATE, ptrProp_getter_wrap,        ptrProp_setter_wrap },
			{ 0, 0, 0, NULL, NULL }
		};

		//---------------------------------------------------
		// static properties
		//---------------------------------------------------

		/*JSBool staticIntProp_getter_wrap(JSContext* cx, JSObject* obj, jsid id, jsval* vp)
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

		JSPropertySpec static_properties[] = {
			{ "staticIntProp",        0, JSPROP_SHARED | JSPROP_ENUMERATE, staticIntProp_getter_wrap,        staticIntProp_setter_wrap },
			{ 0, 0, 0, NULL, NULL }
		};*/

		//---------------------------------------------------
		// Constructor
		//---------------------------------------------------
		JSBool constructor(JSContext *cx, uintN argc, jsval *vp)
		{
			JSObject* obj = JS_NewObject(cx, &jsClass, prototype, NULL);
			if (!obj)
				return false;

			if(!JS_SetPrivate(cx, obj, new ::UsingSimpleClass()))
			{
				// TODO: throw js-exception
			}

			JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));

			return true;
		}

		//---------------------------------------------------
		// Exposing the functionality
		//---------------------------------------------------
		JSBool init(JSContext* cx, JSObject* scope)
		{
			prototype = JS_InitClass(cx, scope, 

				// parent proto
				NULL, 

				&jsClass,

				// native constructor function and min arg count
				constructor, 0,

				// instance properties
				instance_properties, 

				// instance functions
				instance_functions,

				// static properties
				NULL /*static_properties*/, 

				// static functions
				NULL);

			return true;
		}
	}
}