#ifndef __ASTOBJECT_VARIABLE_DECL_HPP__
#define __ASTOBJECT_VARIABLE_DECL_HPP__

#include <string>
#include "ASTObject.hpp"
#include "ASTType.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Variable_Decl: public ASTObject
	{
	public:
		

		ASTObject_Variable_Decl(const std::string& nodeName)
			: ASTObject(nodeName), m_type(NULL)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_VARIABLE_DECL; }

		// TODO: delete when setting
		ASTType* getType() const { return m_type; }
		void setType(ASTType* theType){ m_type = theType; }

	protected:
		ASTType* m_type;
	};


}

#endif // __ASTOBJECT_VARIABLE_DECL_HPP__