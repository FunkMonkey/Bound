#ifndef __ASTOBJECT_FIELD_HPP__
#define __ASTOBJECT_FIELD_HPP__

#include "ASTObject_Variable_Decl.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Field: public ASTObject_Variable_Decl
	{
	public:

		ASTObject_Field(const std::string& nodeName)
			: ASTObject_Variable_Decl(nodeName), m_isStatic(false)
		{

		}

		virtual ~ASTObject_Field(){}

		virtual ASTObjectKind getKind() const { return KIND_FIELD; }

		ASTObjectAccess getAccess() const { return m_access; }
		void setAccess(ASTObjectAccess acc){ m_access = acc; }

		bool isStatic() const { return m_isStatic; }
		void setStatic(bool val){ m_isStatic = val; }

	protected:
		ASTObjectAccess m_access;
		bool m_isStatic;
	};


}

#endif // __ASTOBJECT_FIELD_HPP__