#ifndef GENERIC_WRAPPER_HPP
#define GENERIC_WRAPPER_HPP

#include "jsapi.h"

namespace jswrap
{
	namespace GenericWrapper
	{
		class any_ptr
		{
			void* ptr_;
			void (*thr_)(void*);

			template <typename T>
			static void thrower(void* ptr) { throw static_cast<T*>(ptr); }

		public:

			template <typename T>
			any_ptr(T* ptr) : ptr_(ptr), thr_(&thrower<T>) {}

			template <typename U>
			U* cast() const {
				try { thr_(ptr_); }
				catch (U* ptr) { return static_cast<U*>(ptr); }
				catch (...) {}
				return 0;
			}
		};

		extern JSObject* prototype;
		extern JSClass jsClass;
		//JSBool init(JSContext* cx, JSObject* scope);

		template<class T>
		static T getPrivateFromGenericWrapper(JSContext* cx, jsval val)
		{
			if(!JSVAL_IS_OBJECT(val))
				throw exception("jsval is not a JSObject");

			JSObject* jsObject = JSVAL_TO_OBJECT(val);

			if(JS_GET_CLASS(cx, jsObject) != &jsClass)
				throw exception("Private data has wrong type");

			any_ptr* priv = static_cast<any_ptr*>(JS_GetPrivate(cx, jsObject));

			return priv->cast<T>();
		}

		template<class T>
		JSObject* createGenericWrapper(JSContext* cx, T* obj)
		{
			return NULL;
		}
	}
}



#endif // GENERIC_WRAPPER_HPP