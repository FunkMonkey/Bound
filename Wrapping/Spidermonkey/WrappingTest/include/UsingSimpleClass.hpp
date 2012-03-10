#ifndef USING_SIMPLECLASS_HPP
#define USING_SIMPLECLASS_HPP

#include "SimpleClass.hpp"

class UsingSimpleClass
{
public:
	UsingSimpleClass()
		: m_ptrProp(new SimpleClass())
	{

	}

	SimpleClass        propField;
	static SimpleClass staticPropField;

	// as setters and getters
	SimpleClass& getProp(){ return m_prop; }
	void setProp(const SimpleClass& val){ m_prop = val; }

	SimpleClass& getLazyProp(){ return m_prop; }
	void setLazyProp(const SimpleClass& val){ m_prop = val; }

	// --- Pointers ---
	SimpleClass*        simpleClassPtrPropField;
	
	SimpleClass* getPtrProp(){ return m_ptrProp; }
	void setPtrProp(SimpleClass* val){ m_ptrProp = val; }

	// testing functions
	void passCopy(SimpleClass copy);
	void passRef(SimpleClass& ref);
	void passPtr(SimpleClass* ptr);

	SimpleClass returnCopy(){ return SimpleClass(); }
	SimpleClass& returnRef(){ return m_prop; }
	SimpleClass* returnPtr(){ return m_ptrProp; }
	SimpleClass* returnNull(){ return 0; }

protected:
	SimpleClass m_prop;
	SimpleClass* m_ptrProp;
};

#endif // USING_SIMPLECLASS_HPP