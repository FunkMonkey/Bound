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
			: ASTObject(nodeName), m_type(NULL), m_typeCanon(NULL)
		{
		}

		virtual ~ASTObject_Typedef()
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

		virtual ASTObjectKind getKind() const { return KIND_TYPEDEF; }

		// TODO: delete when setting
		ASTType* getType() const { return m_type; }
		void setType(ASTType* theType){ m_type = theType; }

		ASTType* getTypeCanonical() const { return m_typeCanon; }
		void setTypeCanonical(ASTType* theType){ m_typeCanon = theType; }

	protected:
		ASTType* m_type;
		ASTType* m_typeCanon;
	};


}

#endif // __ASTOBJECT_TYPEDEF_HPP__