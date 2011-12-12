
#include "ASTObject_Struct.hpp"
#include "ASTObject_Constructor.hpp"
#include "ASTObject_Destructor.hpp"


namespace CPPAnalyzer
{
	void ASTObject_Struct::addConstructor(ASTObject_Constructor* constructor)
	{
		// TODO check for NULL

		this->addChild(static_cast<ASTObject*>(constructor));
		this->m_constructors.push_back(constructor);
	}

	void ASTObject_Struct::setDestructor(ASTObject_Destructor* destructor)
	{
		// TODO check for NULL

		this->addChild(static_cast<ASTObject*>(destructor));
		this->m_destructor = destructor;
	}

	void ASTObject_Struct::addBase(ASTObject_Struct* base, ASTObjectAccess access)
	{
		AST_BaseStruct baseStruct;
		baseStruct.base = base;
		baseStruct.access = access;
		m_bases.push_back(baseStruct);
	}
}