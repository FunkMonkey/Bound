#ifndef __ASTOBJECT_TYPEDEF_HPP__
#define __ASTOBJECT_TYPEDEF_HPP__

#include "ASTObject.hpp"
#include "ASTType.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Typedef: public ASTObject
	{
	public:
		

		ASTObject_Typedef(const std::string& nodeName)
			: ASTObject(nodeName), m_type(NULL)
		{
		}

		virtual ASTObjectKind getKind() const { return KIND_TYPEDEF; }

		// TODO: delete when setting
		ASTType* getType() const { return m_type; }
		void setType(ASTType* theType){ m_type = theType; }

	protected:
		ASTType* m_type;
	};


}

#endif // __ASTOBJECT_TYPEDEF_HPP__