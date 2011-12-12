#ifndef __ASTOBJECT_CONSTRUCTOR_HPP__
#define __ASTOBJECT_CONSTRUCTOR_HPP__

#include "ASTObject_Member_Function.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Constructor: public ASTObject_Member_Function
	{
	public:

		ASTObject_Constructor(const std::string& nodeName)
			: ASTObject_Member_Function(nodeName)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_CONSTRUCTOR; }

	protected:
	};


}

#endif // __ASTOBJECT_CONSTRUCTOR_HPP__