struct List {
	int Data;
	struct List *Next;
	
	protected:
	int blbb;
};

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