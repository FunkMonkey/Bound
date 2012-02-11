#ifndef __ASTOBJECT_TEMPLATEPARAMETER_HPP__
#define __ASTOBJECT_TEMPLATEPARAMETER_HPP__

#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	class ASTObject_TemplateParameter: public ASTObject
	{
	public:

		ASTObject_TemplateParameter(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}
	};

	class ASTObject_TemplateTypeParameter: public ASTObject_TemplateParameter
	{
	public:

		ASTObject_TemplateTypeParameter(const std::string& nodeName)
			: ASTObject_TemplateParameter(nodeName)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TYPE_PARAMETER; }

	};

	class ASTObject_TemplateNonTypeParameter: public ASTObject_TemplateParameter
	{
	public:

		ASTObject_TemplateNonTypeParameter(const std::string& nodeName)
			: ASTObject_TemplateParameter(nodeName)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_NON_TYPE_PARAMETER; }

	};

	class ASTObject_TemplateTemplateParameter: public ASTObject_TemplateParameter
	{
	public:

		ASTObject_TemplateTemplateParameter(const std::string& nodeName)
			: ASTObject_TemplateParameter(nodeName)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TEMPLATE_PARAMETER; }

	};


}

#endif // __ASTOBJECT_TEMPLATEPARAMETER_HPP__