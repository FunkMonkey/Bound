typedef int        Int;
typedef const int  ConstInt;

typedef int*              IntPtr;
typedef const int*        ConstIntPtr;
typedef const int * const ConstIntConstPtr;
typedef int * const       IntConstPtr;

typedef int&              IntRef;
typedef const int&        ConstIntRef;

typedef IntPtr IntPtrSugar;
typedef const IntPtr ConstIntPtrSugar;

typedef IntConstPtr       IntConstPtrSugar;
typedef const IntConstPtr ConstIntConstPtrSugar;

int i;
Int i_T;

const Int* const constIntConstPtr_T;

int*   intPtr;
IntPtr intPtr_T;
const int*  constIntPtr;
ConstIntPtr constIntPtr_T;
const int * const constIntConstPtr;
ConstIntConstPtr  constIntConstPtr_T;

int&   intRef;
IntRef intRef_T;

const int&  constIntRef;
ConstIntRef constIntRef_T;

IntPtrSugar intPtrSugar;
ConstIntPtrSugar constIntPtrSugar;
const IntPtrSugar constIntPtrSugar2;
ConstIntPtrSugar* constIntPtrSugarPtr;

IntConstPtrSugar intConstPtrSugar;
ConstIntConstPtrSugar constIntConstPtrSugar;
const IntConstPtrSugar constIntConstPtrSugar2;

ConstIntConstPtrSugar* constIntConstPtrSugarPtr;

IntPtr const IntConstPtr_test;

// ==========================================================

namespace Classes
{
	class Base
	{
	};

	class Sub: public Base
	{
	};
}

namespace Typedefs
{
	typedef Classes::Base T_Base;
	typedef Classes::Sub T_Sub;
	
	typedef Classes::Base* BasePtr;
	typedef Classes::Sub*  SubPtr;
	
	typedef const Classes::Base* ConstBasePtr;
	typedef const Classes::Sub*  ConstSubPtr;
	
	typedef const Classes::Base* const ConstBaseConstPtr;
	typedef const Classes::Sub*  const ConstSubConstPtr;
	
	typedef Classes::Base& BaseRef;
	typedef Classes::Sub&  SubRef;
	
	typedef const Classes::Base& ConstBaseRef;
	typedef const Classes::Sub&  ConstSubRef;
}

void***const** superPointer;

const Typedefs::ConstBaseConstPtr constConstBaseConstPtr;
Typedefs::BaseRef baseRef;
Typedefs::ConstBaseRef constBaseRef;
const Typedefs::ConstBaseConstPtr& constBaseRefPtrRef;

const Typedefs::ConstBaseRef constConstBaseRef;

