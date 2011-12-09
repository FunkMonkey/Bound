
namespace MyNamespace
{
	namespace
	{

	}

	int SOMETHING = 3;

	struct List;

	struct List {
		char* testString;
		const bool fool;
		unsigned int unInt;
		int Data;
		List *Next;
		const List* otherNext;
		
		protected:
		int blbb;

		void funcDecl(int i);
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

	float sum(int x)
	{
		return 8.0;
	}
}

