#ifndef __ASTOBJECT_FUNCTION_HPP__
#define __ASTOBJECT_FUNCTION_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Parameter;
	class ASTType;

	class ASTObject_Function: public ASTObject
	{
	public:
		ASTObject_Function(const std::string& nodeName)
			: ASTObject(nodeName), m_returnType(NULL), m_returnTypeCanon(NULL)
		{

		}

		virtual ~ASTObject_Function();

		virtual ASTObjectKind getKind() const { return KIND_FUNCTION; }

		ASTType* getReturnType() const { return m_returnType; }
		void setReturnType(ASTType* theType){ m_returnType = theType; }

		ASTType* getReturnTypeCanonical() const { return m_returnTypeCanon; }
		void setReturnTypeCanonical(ASTType* theType){ m_returnTypeCanon = theType; }

		void addParameter(ASTObject_Parameter* param);
		const std::vector<ASTObject_Parameter*>& getParameters() const { return m_parameters; }

		// TODO: get parameters, removeParam

	protected:
		ASTType* m_returnType;
		ASTType* m_returnTypeCanon;

		std::vector<ASTObject_Parameter*> m_parameters;
		// TODO: function-type
	};


}

#endif // __ASTOBJECT_FUNCTION_HPP__