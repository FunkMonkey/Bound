#ifndef __ASTOBJECT_ENUM_HPP__
#define __ASTOBJECT_ENUM_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Enum: public ASTObject
	{
	public:
		

		ASTObject_Enum(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_ENUM; }

	protected:

	};

	class ASTObject_EnumConstant: public ASTObject
	{
	public:
		

		ASTObject_EnumConstant(const std::string& nodeName)
			: ASTObject(nodeName), m_value(0)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_ENUMCONSTANT; }

		// TODO: support unsigned values
		long long getValue() const { return m_value; }
		void setValue(long long val){m_value = val; }

	protected:
		long long m_value;
	};


}

#endif // __ASTOBJECT_ENUM_HPP__