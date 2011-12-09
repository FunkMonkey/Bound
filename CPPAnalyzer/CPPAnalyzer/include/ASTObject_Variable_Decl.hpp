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
			: ASTObject(nodeName), m_type(NULL), m_typeCanon(NULL)
		{

		}

		virtual ~ASTObject_Variable_Decl()
		{
			// cleaning up
			if(m_type)
			{
				delete m_type;
				m_type = NULL;
			}

			if(m_typeCanon)
			{
				delete m_typeCanon;
				m_typeCanon = NULL;
			}
		}

		virtual ASTObjectKind getKind() const { return KIND_VARIABLE_DECL; }

		ASTType* getType() const { return m_type; }
		void setType(ASTType* theType){ m_type = theType; }

		ASTType* getTypeCanonical() const { return m_typeCanon; }
		void setTypeCanonical(ASTType* theType){ m_typeCanon = theType; }

	protected:
		ASTType* m_type;
		ASTType* m_typeCanon;
	};


}

#endif // __ASTOBJECT_VARIABLE_DECL_HPP__