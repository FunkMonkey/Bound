#ifndef __ASTOBJECT_TEMPLATEARGUMENT_HPP__
#define __ASTOBJECT_TEMPLATEARGUMENT_HPP__

#include "ASTObject.hpp"

class ASTType;

namespace CPPAnalyzer
{
	class ASTObject_TemplateArgument: public ASTObject
	{
	public:

		ASTObject_TemplateArgument(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}

	};

	class ASTObject_TemplateNullArgument: public ASTObject_TemplateArgument
	{
	public:

		ASTObject_TemplateNullArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_NULL_ARGUMENT; }

	};

	class ASTObject_TemplateTypeArgument: public ASTObject_TemplateArgument
	{
	public:

		ASTObject_TemplateTypeArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName), m_type(nullptr){}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TYPE_ARGUMENT; }

		ASTType* getType() const { return m_type; }
		void setType(ASTType* elType){ m_type = elType; }

	protected:

		ASTType* m_type;

	};

	class ASTObject_TemplateDeclarationArgument: public ASTObject_TemplateArgument
	{
	public:

		ASTObject_TemplateDeclarationArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_DECLARATION_ARGUMENT; }

		ASTObject* getDeclaration() const { return m_decl; }
		void setDeclaration(ASTObject* decl){ m_decl = decl; }

	protected:
		ASTObject* m_decl;

	};

	class ASTObject_TemplateIntegralArgument: public ASTObject_TemplateArgument
	{
	public:

		ASTObject_TemplateIntegralArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_INTEGRAL_ARGUMENT; }

		long long getIntegral() const {return m_integral; }
		void setIntegral(long long val){ m_integral = val; }

	protected:
		long long m_integral;

	};

	class ASTObject_TemplateTemplateArgument: public ASTObject_TemplateArgument
	{
	public:

		ASTObject_TemplateTemplateArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TEMPLATE_ARGUMENT; }

		ASTObject* getTemplate() const { return m_template; }
		void setTemplate(ASTObject* templ){ m_template = templ; }

	protected:
		ASTObject* m_template;

	};

	class ASTObject_TemplateTemplateExpansionArgument: public ASTObject_TemplateArgument
	{
	public:

		ASTObject_TemplateTemplateExpansionArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TEMPLATE_EXPANSION_ARGUMENT; }

	};

	class ASTObject_TemplateExpressionArgument: public ASTObject_TemplateArgument
	{
	public:

		ASTObject_TemplateExpressionArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_EXPRESSION_ARGUMENT; }

	};

	class ASTObject_TemplatePackArgument: public ASTObject_TemplateArgument
	{
	public:

		ASTObject_TemplatePackArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_PACK_ARGUMENT; }

	};

	


}

#endif // __ASTOBJECT_TEMPLATEARGUMENT_HPP__