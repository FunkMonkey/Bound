
#ifndef WRAP_HELPERS_PRIVATE_DATA_X_HPP
#define WRAP_HELPERS_PRIVATE_DATA_X_HPP

#include "wrap_helpers_x.hpp"

namespace jswrap
{
	//---------------------------------------------------
	// Converting with prototype chain
	//---------------------------------------------------
	template<class T>
	static T* getPrivateAsPtr_NotNull(JSContext* cx, jsval val, JSObject* constructor)
	{
		JSBool isCorrectType = false;
		if(!JS_HasInstance(cx, constructor, val, &isCorrectType))
			throw exception("No instanceof operator");

		if(!isCorrectType)
			throw exception("Private data has wrong type");

		T* priv = static_cast<T*>(JS_GetPrivate(cx, JSVAL_TO_OBJECT(val)));

		if(!priv)
			throw exception("Private data is NULL");

		return priv;
	}

	template<class T>
	static T* getPrivateAsPtr(JSContext* cx, jsval val, JSObject* constructor)
	{
		JSBool isCorrectType = false;
		if(!JS_HasInstance(cx, constructor, val, &isCorrectType))
			throw exception("No instanceof operator");

		if(!isCorrectType)
			throw exception("Private data has wrong type");

		return static_cast<T*>(JS_GetPrivate(cx, JSVAL_TO_OBJECT(val)));
	}

	//---------------------------------------------------
	// Converting with class
	//---------------------------------------------------
	template<class T>
	static T* getPrivateAsPtr_NotNull(JSContext* cx, JSObject* jsObject, JSClass* classP)
	{
		if(JS_GET_CLASS(cx, jsObject) != classP)
			throw exception("Private data has wrong type");

		T* priv = static_cast<T*>(JS_GetPrivate(cx, jsObject));
		if(!priv)
			throw exception("Private data is NULL");

		return priv;
	}

	template<class T>
	static T* getPrivateAsPtr(JSContext* cx, JSObject* jsObject, JSClass* classP)
	{
		if(JS_GET_CLASS(cx, jsObject) != classP)
			throw exception("Private data has wrong type");

		T* priv = static_cast<T*>(JS_GetPrivate(cx, jsObject));

		return priv;
	}

	//---------------------------------------------------
	// getThisInstancePrivateXXX
	//---------------------------------------------------
	template<class T>
	static T* getThisPrivatePtr(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		JSObject* thisObj = ;
		if(!thisObj)
			throw exception("no this-JSObject given");

		return getPrivateAsPtr<T>(cx, thisObj, clasp);
	}

	template<class T>
	static T* getThisPrivatePtr_NotNull(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		JSObject* thisObj = ;
		if(!thisObj)
			throw exception("no this-JSObject given");

		return getPrivateAsPtr_NotNull<T>(cx, thisObj, clasp);
	}

	template<class T>
	static T* getThisPrivatePtr(JSContext* cx, jsval* vp, JSObject* constructor)
	{
		return getPrivateAsPtr<T>(cx, JS_THIS(cx, vp), constructor);
	}

	template<class T>
	static T* getThisPrivatePtr_NotNull(JSContext* cx, jsval* vp, JSObject* constructor)
	{
		return getPrivateAsPtr_NotNull<T>(cx, JS_THIS(cx, vp), constructor);
	}

	//---------------------------------------------------
	// getThisPrivateXXX_unsafe
	//---------------------------------------------------
	template<class T>
	static T* getThisPrivatePtr_unsafe(JSContext* cx, jsval* vp)
	{
		return static_cast<T*>(JS_GetPrivate(cx, JS_THIS_OBJECT(cx, vp)));
	}

	//---------------------------------------------------
	// getThisInstancePrivateXXX_unsafe
	//---------------------------------------------------	
	template<class T>
	static T* getThisPrivatePtr_unsafe(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		return static_cast<T*>(JS_GetInstancePrivate(cx, JS_THIS_OBJECT(cx, vp), clasp, NULL));
	}

	//---------------------------------------------------
	// getPrivateXXX_unsafe
	//---------------------------------------------------
	template<class T>
	static T* getPrivateAsPtr_unsafe(JSContext* cx, JSObject* jsObj)
	{
		return static_cast<T*>(JS_GetPrivate(cx, jsObj));
	}


	//---------------------------------------------------
	// wrapping
	//---------------------------------------------------	
	template<class T>
	JSObject* wrapPtr(JSContext *cx, T* ptr, JSClass *clasp, JSObject *proto)
	{
		JSObject* jsObj = JS_NewObject(cx, clasp, proto, 0);
		if(!jsObj)
			throw "Could not create new JSObject!";

		if(!JS_SetPrivate(cx, jsObj, (void*) ptr))
			throw "Could not wrap pointer";

		return jsObj;
	}

	template<class T>
	JSObject* wrapRef(JSContext *cx, T& ref, JSClass *clasp, JSObject *proto)
	{
		JSObject* jsObj = JS_NewObject(cx, clasp, proto, 0);
		if(!jsObj)
			throw "Could not create new JSObject!";

			if(!JS_SetPrivate(cx, jsObj, &ref))
				throw "Could not wrap reference";

		return jsObj;
	}

	template<class T>
	JSObject* wrapCopy(JSContext *cx, T* ptr, JSClass *clasp, JSObject *proto)
	{
		JSObject* jsObj = JS_NewObject(cx, clasp, proto, 0);
		if(!jsObj)
			throw "Could not create new JSObject!";

			if(!JS_SetPrivate(cx, jsObj, (void*)new T(*ptr)))
				throw "Could not wrap pointer";

		return jsObj;
	}

	template<class T>
	JSObject* wrapCopy(JSContext *cx, T& ref, JSClass *clasp, JSObject *proto)
	{
		JSObject* jsObj = JS_NewObject(cx, clasp, proto, 0);
		if(!jsObj)
			throw "Could not create new JSObject!";

			if(!JS_SetPrivate(cx, jsObj, (void*) new T(ref)))
				throw "Could not wrap pointer";

		return jsObj;
	}
}

#endif // WRAP_HELPERS_PRIVATE_DATA_X_HPP