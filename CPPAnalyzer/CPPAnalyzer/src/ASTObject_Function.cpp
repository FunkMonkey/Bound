
#include "ASTObject_Function.hpp"
#include "ASTObject_Parameter.hpp"


namespace CPPAnalyzer
{
	void ASTObject_Function::addParameter(ASTObject_Parameter* param)
	{
		this->addChild(param);
		m_parameters.push_back(param);
	}
}