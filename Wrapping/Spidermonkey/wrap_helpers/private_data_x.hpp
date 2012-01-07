
#ifndef WRAP_HELPERS_PRIVATE_DATA_X_HPP
#define WRAP_HELPERS_PRIVATE_DATA_X_HPP

#include "wrap_helpers_x.hpp"

namespace jswrap
{
	//---------------------------------------------------
	// getThisPrivateXXX
	//---------------------------------------------------
	template<class T>
	static T& getThisPrivateRef(JSContext* cx, jsval* vp)
	{
		JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
		if(!thisObj)
			throw exception("no this-JSObject given");

		T* priv = static_cast<T*>(JS_GetPrivate(cx, thisObj));

		if(!priv)
			throw exception("private data is NULL");

		return *priv;
	}

	template<class T>
	static T* getThisPrivatePtr(JSContext* cx, jsval* vp)
	{
		JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
		if(!thisObj)
			throw exception("no this-JSObject given");

		T* priv = static_cast<T*>(JS_GetPrivate(cx, thisObj));

		return priv;
	}

	template<class T>
	static T* getThisPrivatePtr_NotNULL(JSContext* cx, jsval* vp)
	{
		JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
		if(!thisObj)
			throw exception("no this-JSObject given");

		T* priv = static_cast<T*>(JS_GetPrivate(cx, thisObj));

		if(!priv)
			throw exception("private data is NULL");

		return priv;
	}

	//---------------------------------------------------
	// getThisInstancePrivateXXX
	//---------------------------------------------------
	template<class T>
	static T& getThisInstancePrivateRef(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
		if(!thisObj)
			throw exception("no this-JSObject given");

		T* priv = static_cast<T*>(JS_GetInstancePrivate(cx, thisObj, clasp));

		if(!priv)
			throw exception("private data is NULL");

		return *priv;
	}

	template<class T>
	static T* getThisInstancePrivatePtr(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
		if(!thisObj)
			throw exception("no this-JSObject given");

		T* priv = static_cast<T*>(JS_GetInstancePrivate(cx, thisObj, clasp));

		return priv;
	}

	template<class T>
	static T* getThisInstancePrivatePtr_NotNULL(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
		if(!thisObj)
			throw exception("no this-JSObject given");

		T* priv = static_cast<T*>(JS_GetInstancePrivate(cx, thisObj, clasp));

		if(!priv)
			throw exception("private data is NULL");

		return priv;
	}

	//---------------------------------------------------
	// getThisPrivateXXX_unsafe
	//---------------------------------------------------
	template<class T>
	static T& getThisPrivateRef_unsafe(JSContext* cx, jsval* vp)
	{
		return *(static_cast<T*>(JS_GetPrivate(cx, JS_THIS_OBJECT(cx, vp))));
	}

	template<class T>
	static T* getThisPrivatePtr_unsafe(JSContext* cx, jsval* vp)
	{
		return static_cast<T*>(JS_GetPrivate(cx, JS_THIS_OBJECT(cx, vp)));
	}

	//---------------------------------------------------
	// getThisInstancePrivateXXX_unsafe
	//---------------------------------------------------
	template<class T>
	static T& getThisInstancePrivateRef_unsafe(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		return *(static_cast<T*>(JS_GetInstancePrivate(cx, JS_THIS_OBJECT(cx, vp), clasp, NULL)));
	}
	
	template<class T>
	static T* getThisInstancePrivatePtr_unsafe(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		return static_cast<T*>(JS_GetInstancePrivate(cx, JS_THIS_OBJECT(cx, vp), clasp, NULL));
	}
}

#endif // WRAP_HELPERS_PRIVATE_DATA_X_HPP