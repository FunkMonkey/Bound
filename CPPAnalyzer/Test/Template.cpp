
template<class T>
class TemplatedClass
{
	T m_memberT;
	int test;
	T* m_pointerToT;
};

template class TemplatedClass<int>;

namespace NameSpace
{
	template class TemplatedClass<float>;
}