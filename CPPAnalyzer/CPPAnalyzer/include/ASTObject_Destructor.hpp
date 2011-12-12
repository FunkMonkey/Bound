#ifndef __ASTOBJECT_DESTRUCTOR_HPP__
#define __ASTOBJECT_DESTRUCTOR_HPP__

#include "ASTObject_Member_Function.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Destructor: public ASTObject_Member_Function
	{
	public:

		ASTObject_Destructor(const std::string& nodeName)
			: ASTObject_Member_Function(nodeName)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_DESTRUCTOR; }

	protected:
	};


}

#endif // __ASTOBJECT_DESTRUCTOR_HPP__