
#ifndef WRAP_HELPERS_PRIVATE_DATA_X_HPP
#define WRAP_HELPERS_PRIVATE_DATA_X_HPP

#include "wrap_helpers_x.hpp"

namespace jswrap
{
	//---------------------------------------------------
	// Converting with prototype chain
	//---------------------------------------------------
	/** 
	 * Returns the private data of a jsval casted to the given class
	 *    - checks the prototype chain and throws exception if wrong class
	 *    - throws exception if private data is NULL
	 *
	 * \param 	cx            Context
	 * \param 	val           jsval to retrieve private data from
	 * \param 	constructor   Constructor function to check
	 * \return	Casted private data
	 */
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

	/** 
	 * Returns the private data of a jsval casted to the given class
	 *    - checks the prototype chain and throws exception if wrong class
	 *
	 * \param 	cx            Context
	 * \param 	val           jsval to retrieve private data from
	 * \param 	constructor   Constructor function to check
	 * \return	Casted private data or NULL
	 */
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
	/** 
	 * Returns the private data of a JSObject casted to the given class
	 *    - checks the the JSClass and throws exception if wrong class
	 *    - throws exception if private data is NULL
	 *
	 * \param 	cx            Context
	 * \param 	val           JSObject to retrieve private data from
	 * \param 	constructor   Constructor function to check
	 * \return	Casted private data
	 */
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

	/** 
	 * Returns the private data of a JSObject casted to the given class
	 *    - checks the JSClass and throws exception if wrong class
	 *
	 * \param 	cx            Context
	 * \param 	val           JSObject to retrieve private data from
	 * \param 	constructor   Constructor function to check
	 * \return	Casted private data or NULL
	 */
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
	/*template<class T>
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
	}*/

	//---------------------------------------------------
	// getThisPrivateXXX_unsafe
	//---------------------------------------------------
	/*template<class T>
	static T* getThisPrivatePtr_unsafe(JSContext* cx, jsval* vp)
	{
		return static_cast<T*>(JS_GetPrivate(cx, JS_THIS_OBJECT(cx, vp)));
	}*/

	//---------------------------------------------------
	// getThisInstancePrivateXXX_unsafe
	//---------------------------------------------------	
	/*template<class T>
	static T* getThisPrivatePtr_unsafe(JSContext* cx, jsval* vp, JSClass* clasp)
	{
		return static_cast<T*>(JS_GetInstancePrivate(cx, JS_THIS_OBJECT(cx, vp), clasp, NULL));
	}*/

	//---------------------------------------------------
	// getPrivateXXX_unsafe
	//---------------------------------------------------
	/*template<class T>
	static T* getPrivateAsPtr_unsafe(JSContext* cx, JSObject* jsObj)
	{
		return static_cast<T*>(JS_GetPrivate(cx, jsObj));
	}*/


	//---------------------------------------------------
	// wrapping
	//---------------------------------------------------	
	/** 
	 * Wraps the given pointer into a JSObject with the given class and prototype
	 *
	 * \param 	cx     JSContext
	 * \param 	ptr    Pointer to wrap
	 * \param 	clasp  Class to use
	 * \param 	proto  Prototype to use
	 * \return	Newly created JSObject
	 */
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

	/** 
	 * Wraps the given reference into a JSObject with the given class and prototype
	 *
	 * \param 	cx     JSContext
	 * \param 	ref    Reference to wrap
	 * \param 	clasp  Class to use
	 * \param 	proto  Prototype to use
	 * \return	Newly created JSObject
	 */
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

	/** 
	 * Wraps a copy of the given pointer into a JSObject with the given class and prototype
	 *
	 * \param 	cx     JSContext
	 * \param 	ptr    Pointer to wrap copy of
	 * \param 	clasp  Class to use
	 * \param 	proto  Prototype to use
	 * \return	Newly created JSObject
	 */
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

	/** 
	 * Wraps a copy of the given reference into a JSObject with the given class and prototype
	 *
	 * \param 	cx     JSContext
	 * \param 	ref    Reference to wrap copy of
	 * \param 	clasp  Class to use
	 * \param 	proto  Prototype to use
	 * \return	Newly created JSObject
	 */
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