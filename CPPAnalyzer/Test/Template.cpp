
template<class T>
class TemplatedClass
{
	int test;
	T* m_pointerToT;
}

template class TemplatedClass<int>;

namespace NameSpace
{
	template class TemplatedClass<float>;
}