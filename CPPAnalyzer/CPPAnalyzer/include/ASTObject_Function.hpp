#ifndef __ASTOBJECT_FUNCTION_HPP__
#define __ASTOBJECT_FUNCTION_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Variable_Decl;

	class ASTObject_Function: public ASTObject
	{
	public:
		ASTObject_Function(const std::string& nodeName)
			: ASTObject(nodeName), m_returnType(NULL), m_returnTypeCanon(NULL)
		{

		}

		virtual ~ASTObject_Function()
		{
			// cleaning up
			if(m_returnType)
			{
				delete m_returnType;
				m_returnType = NULL;
			}

			if(m_returnTypeCanon)
			{
				delete m_returnTypeCanon;
				m_returnTypeCanon = NULL;
			}
		}

		virtual ASTObjectKind getKind() const { return KIND_FUNCTION; }

		ASTType* getReturnType() const { return m_returnType; }
		void setReturnType(ASTType* theType){ m_returnType = theType; }

		ASTType* getReturnTypeCanonical() const { return m_returnTypeCanon; }
		void setReturnTypeCanonical(ASTType* theType){ m_returnTypeCanon = theType; }

		void addParameter(ASTObject_Variable_Decl* param)
		{
			this->addChild(param);
			m_parameters.push_back(param);
		}

		// TODO: get parameters, removeParam

	protected:
		ASTType* m_returnType;
		ASTType* m_returnTypeCanon;

		std::vector<ASTObject_Variable_Decl*> m_parameters;
	};


}

#endif // __ASTOBJECT_FUNCTION_HPP__