#ifndef __ASTOBJECT_MEMBER_FUNCTION_HPP__
#define __ASTOBJECT_MEMBER_FUNCTION_HPP__

#include "ASTObject_Function.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Member_Function: public ASTObject_Function
	{
	public:

		ASTObject_Member_Function(const std::string& nodeName)
			: ASTObject_Function(nodeName), m_isVirtual(false), m_isConst(false)
		{

		}

		virtual ~ASTObject_Member_Function(){}

		virtual ASTObjectKind getKind() const { return KIND_MEMBER_FUNCTION; }

		ASTObjectAccess getAccess() const { return m_access; }
		void setAccess(ASTObjectAccess acc){ m_access = acc; }

		bool isVirtual() const { return m_isVirtual; }
		void setVirtual(bool val){ m_isVirtual = val; }

		bool isConst() const { return m_isConst; }
		void setConst(bool isConst){ m_isConst = isConst; }

	protected:
		ASTObjectAccess m_access;
		bool m_isVirtual;
		bool m_isConst;
	};


}

#endif // __ASTOBJECT_MEMBER_FUNCTION_HPP__