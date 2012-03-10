#ifndef SIMPLECLASS_HPP
#define SIMPLECLASS_HPP

class SimpleClass
{
public:
	SimpleClass()
		: floatPropField(9.0f)
	{
		m_intProp = count++;
	}

	SimpleClass(const SimpleClass& rhs)
		: floatPropField(rhs.floatPropField)
	{
		m_intProp = count++;
	}

	void void_param0();
	static void static_void_param0();

	// as setters and getters
	int getIntProp(){ return m_intProp; }
	void setIntProp(int val){ m_intProp = val; }

	static int getStaticIntProp(){ return m_staticIntProp; }
	static void setStaticIntProp(int val){ m_staticIntProp = val; }

	// as fields
	float floatPropField;
	static float staticFloatPropField;


protected:
	int m_intProp;
	static int m_staticIntProp;

// for testing only
public:
	static int count;

};

#endif //SIMPLECLASS_HPP