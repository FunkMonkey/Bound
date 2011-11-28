// lazy properties

struct TestComponent
{

	int x;
	int y;
	
	TestComponent() : x(0), y(0)
	{
	}
};

class TestClass
{
	TestComponent comp1;	// lazy prop will always point to this object
	TestComponent* comp2;	// lazy prop will point to object that was comp2 at the time
							// the prop was created
	
	public:
	TestClass()
	{
		comp2 = new TestComponent();
	}
	
	~TestClass()
	{
		delete comp2;
	}
	
	TestComponent& getComp1(){ return comp1; }
	TestComponent& getComp2(){ return comp2; }
	
	TestComponent comp3;	// lazy prop will always point to this object
};

TestClass* getNewTestClass(){ return new TestClass(); }
void deleteTestClass(TestClass* testClass){ delete testClass;}
void deleteTestComponent(TestComponent* testComp){ delete testComp;}