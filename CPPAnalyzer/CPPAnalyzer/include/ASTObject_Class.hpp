#ifndef __ASTOBJECT_CLASS_HPP__
#define __ASTOBJECT_CLASS_HPP__

#include "ASTObject_Struct.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Class: public ASTObject_Struct
	{
	public:
		

		ASTObject_Class(const std::string& nodeName)
			: ASTObject_Struct(nodeName)
		{
			setCurrentAccess(ACCESS_PRIVATE);
		}

		virtual ~ASTObject_Class(){}

		virtual ASTObjectKind getKind() const { return KIND_CLASS; }
	};


}

#endif // __ASTOBJECT_CLASS_HPP__