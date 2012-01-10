
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
	};

	class TestClass{};

	class TestClass2 : public TestClass {};

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
}

