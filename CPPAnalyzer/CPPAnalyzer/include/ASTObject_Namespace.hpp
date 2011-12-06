#ifndef __ASTOBJECT_NAMESPACE_HPP__
#define __ASTOBJECT_NAMESPACE_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Namespace: public ASTObject
	{
	public:
		explicit ASTObject_Namespace(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}

		explicit ASTObject_Namespace(const char* nodeName)
					: ASTObject(nodeName)
				{

				}

		virtual ~ASTObject_Namespace(){}

		virtual ASTObjectKind getKind() const { return KIND_NAMESPACE; }

		bool isAnonymous(){ return this->m_nodeName == ""; }
	};


}

#endif // __ASTOBJECT_NAMESPACE_HPP__
