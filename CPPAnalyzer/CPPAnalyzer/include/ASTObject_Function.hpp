#ifndef __ASTOBJECT_FUNCTION_HPP__
#define __ASTOBJECT_FUNCTION_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Function: public ASTObject
	{
	public:
		

		ASTObject_Function(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}

		virtual ~ASTObject_Function(){}

		virtual ASTObjectKind getKind() const { return KIND_FUNCTION; }

	protected:
		ASTObjectAccess m_access;
		std::string m_type;
	};


}

#endif // __ASTOBJECT_FUNCTION_HPP__