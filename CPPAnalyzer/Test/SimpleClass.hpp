#ifndef SIMPLECLASS_HPP
#define SIMPLECLASS_HPP

class SimpleClass
{
public:
	void constMethod() const;
	void nonConstMethod();
	
	SimpleClass()
		: m_intProp(7), floatPropField(9.0f)
	{
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
	

};

#endif //SIMPLECLASS_HPP