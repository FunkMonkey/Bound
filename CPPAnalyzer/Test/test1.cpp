struct List {
	int Data;
	struct List *Next;
};

int sum(struct List *Node, const List& other, const int fool) {
	int result = 0;
	for (; Node; Node = Node->Next)
		result = result + Node->Data;
	return result;
}