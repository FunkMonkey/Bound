namespace SomeNamespace
{
	class SomeClass;
	
	class SomeClass
	{
		int member;
	};
	
	int aFunction(float param)
	{
		float res = param * 3;
		return res;
	}
}

extern "C"
{
	void dontFilter(SomeNamespace::SomeClass pInstance){};
}