#ifndef __ASTOBJECT_STRUCT_HPP__
#define __ASTOBJECT_STRUCT_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Struct: public ASTObject
	{
	public:
		enum Access{
			ACCESS_PRIVATE,
			ACCESS_PROTECTED,
			ACCESS_PUBLIC
		};

		ASTObject_Struct(const std::string& nodeName)
			: ASTObject(nodeName), m_destructor(NULL)
		{

		}

		virtual ~ASTObject_Struct(){}

		virtual ASTObjectKind getKind() const { return KIND_STRUCT; }

		void addDestructor(ASTObject* destructor)
		{
			// TODO check for NULL

			this->addChild(destructor);
			this->m_destructor = destructor;
		}

		void addConstructor(ASTObject* constructor)
		{
			// TODO check for NULL

			this->addChild(constructor);
			this->m_constructors.push_back(constructor);
		}

	protected:

		ASTObject* m_destructor;
		std::vector<ASTObject*> m_constructors; // should be ASTObject_Function
		std::vector<ASTObject*> m_functions;
		Access m_currAccess;
	};


}

#endif // __ASTOBJECT_STRUCT_HPP__