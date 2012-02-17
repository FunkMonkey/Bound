
template<typename T, int* P, template<class> class TT, unsigned I = 7>
class TemplatedClass
{
	T m_memberT;
	int test;
	T* m_pointerToT;
};

template<int* P, template<class> class TT>
class TemplatedClass<bool, P, TT, 1>
{
};

int aP = 3;

bool x = true;

class NoTemplate{};

template<class T>
class TemplateForTemplate{};

template class TemplatedClass<bool, &aP, TemplateForTemplate >;

namespace TestSpace
{
	//template class TemplatedClass<int, &aP, TemplateForTemplate >;
	void tParam(TemplatedClass<int, &aP, TemplateForTemplate > p)
	{
	}
	
	void tParam2(TemplatedClass<int, &aP, TemplateForTemplate > p)
	{
	}
}

template<typename T>
void doIt(){}

template<>
void doIt<bool>(){}

template<>
void doIt<int>(){}




namespace NameSpace
{
	template class TemplatedClass<float, &aP, TemplateForTemplate >;
}