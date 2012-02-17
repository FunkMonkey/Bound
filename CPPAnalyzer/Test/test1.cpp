
float float_param_int_float(int x, float y);
float float_param_int_float(int x, float y);

float float_param_int_float(int x, float y)
{
	return 8.0;
}

namespace MyNamespace
{
	namespace
	{

	}

	int SOMETHING = 3;

	struct List;

	struct List {
		List(int foo);
		~List();
		
		int int_param_float(float x);

		char* testString;
		const bool fool;
		unsigned int unInt;
		int Data;
		List *Next;
		const List* otherNext;
		
		protected:
		int blbb;

		void funcDecl(int i);
		List* returningPointer();
		
		virtual void virtualFunc();
		static void staticFunc();
		static int staticDataMember;
	};

	class TestClass{};

	class TestClass2 : private TestClass {};

	typedef const List MooType;

	struct Testi
	{
		List testList;
		TestClass testClass;
		MooType typedefeed;
	};

	void List::funcDecl(int i){}

	List returnList()
	{
		return List();
	}

	int sum(struct List *Node, const List& other, const int fool) {
		int result = 0;
		for (; Node; Node = Node->Next)
			result = result + Node->Data;
		return result;
	}

	int sum()
	{
		return 0;
	};

	float sum(int x);
	float sum(int x, float y)
	{
		return 8.0;
	}
	
	enum ENUM2
	{
		E2VAL1,
		E2VAL2,
		E2VAL3
	}
}

