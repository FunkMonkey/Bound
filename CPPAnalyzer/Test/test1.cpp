
namespace MyNamespace
{
	namespace
	{

	}

	int SOMETHING = 3;

	struct List;

	struct List {
		const bool fool;
		unsigned int unInt;
		int Data;
		struct List *Next;
		List* otherNext;
		
		protected:
		int blbb;

		void funcDecl(int i);
	};

	class TestClass
	{

	};

	struct Testi
	{
		List testList;
		TestClass testClass;
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

