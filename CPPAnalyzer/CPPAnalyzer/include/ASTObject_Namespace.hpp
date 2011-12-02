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
			: ASTObject(TYPE_NAMESPACE, nodeName)
		{

		}

		explicit ASTObject_Namespace(const char* nodeName)
					: ASTObject(TYPE_NAMESPACE, nodeName)
				{

				}

		bool isAnonymous(){ return this->m_nodeName == ""; }

		virtual ~ASTObject_Namespace(){}
	};


}

#endif // __ASTOBJECT_NAMESPACE_HPP__
