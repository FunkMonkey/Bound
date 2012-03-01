
namespace Outter
{
	namespace Inner
	{
		class Class {};
		
		typedef Class TClass;
		
		Class inst;
		Class* instPtr;
		const Class* constInstPtr;
		
	}
	
	typedef Inner::Class tInnerClass;
	typedef const Inner::Class* const tInnerClassConstPtr;
}

typedef Outter::Inner::Class tOutterInnerClass;


Outter::Inner::Class c;
Outter::Inner::TClass tc;
Outter::Inner::TClass* tcPtr;

Outter::tInnerClassConstPtr x;