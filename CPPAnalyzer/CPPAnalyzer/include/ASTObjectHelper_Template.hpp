#ifndef __ASTOBJECTHELPER_TEMPLATE_HPP__
#define __ASTOBJECTHELPER_TEMPLATE_HPP__

#include "ASTObjectKinds.hpp"
#include <vector>

namespace CPPAnalyzer
{
	class ASTObject_TemplateParameter;
	class ASTObject_TemplateArgument;

	class ASTObjectHelper_Template
	{
	public:

		ASTObjectHelper_Template()
			:m_kind(TEMPLATE_KIND_NON_TEMPLATE)
		{

		}

		ASTObjectTemplateKind getKind() const { return m_kind; }
		void setKind(ASTObjectTemplateKind kind) { m_kind = kind; }

		const std::vector<ASTObject_TemplateParameter*>& getParameters() const { return m_parameters; }
		void addParameter(ASTObject_TemplateParameter* param){ m_parameters.push_back(param); }

		const std::vector<ASTObject_TemplateArgument*>& getArguments() const { return m_arguments; }
		void addArgument(ASTObject_TemplateArgument* param){ m_arguments.push_back(param); }


	protected:

		ASTObjectTemplateKind m_kind;
		std::vector<ASTObject_TemplateParameter*> m_parameters;
		std::vector<ASTObject_TemplateArgument*> m_arguments;
		

	};


}

#endif // __ASTOBJECTHELPER_TEMPLATE_HPP__