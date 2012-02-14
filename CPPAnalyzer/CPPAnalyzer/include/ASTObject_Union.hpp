#ifndef __ASTOBJECT_UNION_HPP__
#define __ASTOBJECT_UNION_HPP__

#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Union: public ASTObject
	{
	public:
		

		ASTObject_Union(const std::string& nodeName)
			: ASTObject(nodeName)
		{
		}

		virtual ASTObjectKind getKind() const { return KIND_UNION; }
	};


}

#endif // __ASTOBJECT_UNION_HPP__