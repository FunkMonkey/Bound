#include "LazyNotInteresting.hpp"

namespace Hidden
{

	class BaseClass1
	{

		public: 

			void funcPublicBase1();
			static void staticFuncPublicBase1();
			int fieldPublicBase1;
			static int staticFieldPublicBase1;
		
		protected:
		
			void funcProtectedBase1();
			static void staticFuncProtectedBase1();
			int fieldProtectedBase1;
			static int staticFieldProtectedBase1;
			
			
		private:
		
			void funcPrivateBase1();
			static void staticFuncPrivateBase1();
			int fieldPrivateBase1;
			static int staticFieldPrivateBase1;
	};

	class BaseClass2: public BaseClass1
	{
	};

	class HiddenClassBase
	{
		public:
		
		int m_someMember;
	};

	class HiddenClass: public HiddenClassBase
	{
		public: 

			void funcPublicHidden();
			static void staticFuncPublicHidden();
			int fieldPublicHidden;
			static int staticFieldPublicHidden;
		
		protected:
		
			void funcProtectedHidden();
			static void staticFuncProtectedHidden();
			int fieldProtectedHidden;
			static int staticFieldProtectedHidden;
			
			
		private:
		
			void funcPrivateHidden();
			static void staticFuncPrivateHidden();
			int fieldPrivateHidden;
			static int staticFieldPrivateHidden;
	};
}

namespace BothFiles
{
	class BothFilesHidden {};
}