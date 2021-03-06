#include "LazyHidden.hpp"

Hidden::BaseClass1* getBaseClass1();

namespace Visible
{

	class SomeSubClass : public Hidden::BaseClass2
	{
			class SubClassPrivate1
			{
			};
			
			void funcPrivate1();
			static void staticFuncPrivate1();
			int fieldPrivate1;
			static int staticFieldPrivate1;
			
			enum EnumPrivate1
			{
				ENUM_VAL_PRIVATE1
			};


		public: 
		
			Hidden::HiddenClass* m_memberHiddenClass;
		
			class SubClassPublic
			{
			};
			
			void funcPublic();
			static void staticFuncPublic();
			int fieldPublic;
			static int staticFieldPublic;
			
			enum EnumPublic
			{
				ENUM_VAL_PUBLIC
			};
		
		protected:
		
			class SubClassProtected
			{
			};
			
			void funcProtected();
			static void staticFuncProtected();
			int fieldProtected;
			static int staticFieldProtected;
			
			enum EnumProtected
			{
				ENUM_VAL_PROTECTED
			};
			
		private:
		
			class SubClassPrivate2
			{
			};
			
			void funcPrivate2();
			static void staticFuncPrivate2();
			int fieldPrivate2;
			static int staticFieldPrivate2;
			
			enum EnumPrivate2
			{
				ENUM_VAL_PRIVATE2
			};

	};
}

namespace BothFiles
{
	class BothFilesVisible {};
}