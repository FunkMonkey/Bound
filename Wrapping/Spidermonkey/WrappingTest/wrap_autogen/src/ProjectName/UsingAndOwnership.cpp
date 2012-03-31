#include "ProjectName/UsingAndOwnership/ClassScriptOwned.hpp"
#include <wrap_helpers/private_data_x.hpp>
#include <wrap_helpers/wrap_helpers_x.hpp>
#include <Mix.hpp>
#include "ProjectName/UsingAndOwnership/ClassNativeOwned.hpp"
#include "ProjectName/UsingAndOwnership.hpp"

namespace jswrap { namespace ProjectName { namespace UsingAndOwnership { 
	
	JSBool wrapper_passScriptOwnedCopy(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::UsingAndOwnership::ClassScriptOwned& p0__copy = *::jswrap::ProjectName::UsingAndOwnership::ClassScriptOwned::getFromJSValue(cx, args[0]);
	
			::UsingAndOwnership::passScriptOwnedCopy(p0__copy);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_passScriptOwnedRef(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::UsingAndOwnership::ClassScriptOwned & p0__ref = *::jswrap::ProjectName::UsingAndOwnership::ClassScriptOwned::getFromJSValue(cx, args[0]);
	
			::UsingAndOwnership::passScriptOwnedRef(p0__ref);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_passScriptOwnedPtr(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::UsingAndOwnership::ClassScriptOwned * p0__ptr = ::jswrap::ProjectName::UsingAndOwnership::ClassScriptOwned::getFromJSValue(cx, args[0]);
	
			::UsingAndOwnership::passScriptOwnedPtr(p0__ptr);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_returnScriptOwnedCopy(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingAndOwnership::ClassScriptOwned& cpp__result = ::UsingAndOwnership::returnScriptOwnedCopy();
		
			JS_RVAL(cx, vp) = OBJECT_TO_JSVAL(::jswrap::ProjectName::UsingAndOwnership::ClassScriptOwned::wrapCopy(cx, cpp__result));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_passNativeOwnedCopy(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::UsingAndOwnership::ClassNativeOwned& p0__copy = *::jswrap::ProjectName::UsingAndOwnership::ClassNativeOwned::getFromJSValue(cx, args[0]);
	
			::UsingAndOwnership::passNativeOwnedCopy(p0__copy);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_passNativeOwnedRef(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::UsingAndOwnership::ClassNativeOwned & p0__ref = *::jswrap::ProjectName::UsingAndOwnership::ClassNativeOwned::getFromJSValue(cx, args[0]);
	
			::UsingAndOwnership::passNativeOwnedRef(p0__ref);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_passNativeOwnedPtr(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			checkMinNumberOfArguments_x(argc, 1);
			jsval* args = JS_ARGV(cx, vp);
	
			::UsingAndOwnership::ClassNativeOwned * p0__ptr = ::jswrap::ProjectName::UsingAndOwnership::ClassNativeOwned::getFromJSValue(cx, args[0]);
	
			::UsingAndOwnership::passNativeOwnedPtr(p0__ptr);
		
			JS_RVAL(cx, vp) = JSVAL_VOID;
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_returnNativeOwnedRef(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingAndOwnership::ClassNativeOwned & cpp__result = ::UsingAndOwnership::returnNativeOwnedRef();
		
			JS_RVAL(cx, vp) = OBJECT_TO_JSVAL(::jswrap::ProjectName::UsingAndOwnership::ClassNativeOwned::wrapInstance(cx, &cpp__result));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSBool wrapper_returnNativeOwnedPtr(JSContext *cx, uintN argc, jsval *vp)
	{
		JSWRAP_TRY_START
		
			::UsingAndOwnership::ClassNativeOwned * cpp__result = ::UsingAndOwnership::returnNativeOwnedPtr();
		
			JS_RVAL(cx, vp) = OBJECT_TO_JSVAL(::jswrap::ProjectName::UsingAndOwnership::ClassNativeOwned::wrapInstance(cx, cpp__result));
		JSWRAP_CATCH_AND_REPORT_JS_ERROR(cx, "")
		
		return true;
	}
	
	JSFunctionSpec functionsDefs[] = {
			JS_FS("passScriptOwnedCopy", wrapper_passScriptOwnedCopy, 1, 0),
			JS_FS("passScriptOwnedRef", wrapper_passScriptOwnedRef, 1, 0),
			JS_FS("passScriptOwnedPtr", wrapper_passScriptOwnedPtr, 1, 0),
			JS_FS("returnScriptOwnedCopy", wrapper_returnScriptOwnedCopy, 0, 0),
			JS_FS("passNativeOwnedCopy", wrapper_passNativeOwnedCopy, 1, 0),
			JS_FS("passNativeOwnedRef", wrapper_passNativeOwnedRef, 1, 0),
			JS_FS("passNativeOwnedPtr", wrapper_passNativeOwnedPtr, 1, 0),
			JS_FS("returnNativeOwnedRef", wrapper_returnNativeOwnedRef, 0, 0),
			JS_FS("returnNativeOwnedPtr", wrapper_returnNativeOwnedPtr, 0, 0),

			JS_FS_END
		};
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
		JSObject* newObj = JS_DefineObject(cx, scope, "UsingAndOwnership", NULL, NULL, 0);
		if(!newObj)
			return false;
			
		if(!JS_DefineFunctions(cx, newObj, functionsDefs))
			return false;
			
		::jswrap::ProjectName::UsingAndOwnership::ClassScriptOwned::init(cx, newObj);
		::jswrap::ProjectName::UsingAndOwnership::ClassNativeOwned::init(cx, newObj);

		return true;
	}
	
} } } 

