
#include "ASTObject_Function.hpp"
#include "ASTObject_Parameter.hpp"


namespace CPPAnalyzer
{
	ASTObject_Function::~ASTObject_Function()
	{
		// cleaning up
		if(m_returnType)
		{
			delete m_returnType;
			m_returnType = NULL;
		}

		if(m_returnTypeCanon)
		{
			delete m_returnTypeCanon;
			m_returnTypeCanon = NULL;
		}
	}

	void ASTObject_Function::addParameter(ASTObject_Parameter* param)
	{
		this->addChild(param);
		m_parameters.push_back(param);
	}
}