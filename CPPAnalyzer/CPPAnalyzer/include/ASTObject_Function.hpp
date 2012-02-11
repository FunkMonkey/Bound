#ifndef __ASTOBJECT_FUNCTION_HPP__
#define __ASTOBJECT_FUNCTION_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"
#include "ASTObjectHelper_Template.hpp"

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

		ASTObjectHelper_Template& getTemplateInfo(){ return m_templateInfo; }
		const ASTObjectHelper_Template& getTemplateInfo() const { return m_templateInfo; }
		void setTemplateInfo(const ASTObjectHelper_Template& val) { m_templateInfo = val; }

	protected:
		ASTType* m_returnType;
		ASTType* m_returnTypeCanon;

		std::vector<ASTObject_Parameter*> m_parameters;
		// TODO: function-type

		ASTObjectHelper_Template m_templateInfo;
		
	};


}

#endif // __ASTOBJECT_FUNCTION_HPP__