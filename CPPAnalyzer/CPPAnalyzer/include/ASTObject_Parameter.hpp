#ifndef __ASTOBJECT_PARAMETER_HPP__
#define __ASTOBJECT_PARAMETER_HPP__

#include "ASTObject_Variable_Decl.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Parameter: public ASTObject_Variable_Decl
	{
	public:

		ASTObject_Parameter(const std::string& nodeName)
			: ASTObject_Variable_Decl(nodeName)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_PARAMETER; }

	};


}

#endif // __ASTOBJECT_PARAMETER_HPP__