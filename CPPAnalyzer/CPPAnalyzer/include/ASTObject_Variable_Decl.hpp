#ifndef __ASTOBJECT_VARIABLE_DECL_HPP__
#define __ASTOBJECT_VARIABLE_DECL_HPP__

#include <string>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Variable_Decl: public ASTObject
	{
	public:
		

		ASTObject_Variable_Decl(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}

		const std::string& getType() const { return m_type; }
		void setAccess(const std::string& theType){ m_type = theType; }

	protected:
		std::string m_type;
	};


}

#endif // __ASTOBJECT_VARIABLE_DECL_HPP__