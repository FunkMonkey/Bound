#ifndef __ASTOBJECT_TEMPLATEARGUMENT_HPP__
#define __ASTOBJECT_TEMPLATEARGUMENT_HPP__

#include "ASTObject.hpp"

class ASTType;

namespace CPPAnalyzer
{
	/** Represents a C++ template argument AST node
	*/
	class ASTObject_TemplateArgument: public ASTObject
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateArgument(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}

	};

	/** Represents a C++ null template argument AST node
	*/
	class ASTObject_TemplateNullArgument: public ASTObject_TemplateArgument
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateNullArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_NULL_ARGUMENT; }

	};

	/** Represents a C++ template type argument AST node
	*/
	class ASTObject_TemplateTypeArgument: public ASTObject_TemplateArgument
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateTypeArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName), m_type(nullptr){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TYPE_ARGUMENT; }

		/** Returns the type expressed by the argument
		 *
		 * \return   Type expressed by argument
		 */
		ASTType* getType() const { return m_type; }

		/** Sets the type expressed by the argument
		 *
		 * \param   elType   Type expressed by argument
		 */
		void setType(ASTType* elType){ m_type = elType; }

	protected:

		ASTType* m_type;

	};

	/** Represents a C++ template declaration argument AST node
	*/
	class ASTObject_TemplateDeclarationArgument: public ASTObject_TemplateArgument
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateDeclarationArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_DECLARATION_ARGUMENT; }

		/** Returns the declaration AST node expressed by the argument
		 *
		 * \return   Declaration AST node expressed by argument
		 */
		ASTObject* getDeclaration() const { return m_decl; }

		/** Sets the declaration AST node expressed by the argument
		 *
		 * \param   decl   Declaration AST node expressed by argument
		 */
		void setDeclaration(ASTObject* decl){ m_decl = decl; }

	protected:
		ASTObject* m_decl;

	};

	/** Represents a C++ template integral argument AST node
	*/
	class ASTObject_TemplateIntegralArgument: public ASTObject_TemplateArgument
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateIntegralArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_INTEGRAL_ARGUMENT; }

		/** Returns the integral expressed by the argument
		 *
		 * \return   Integral expressed by argument
		 */
		long long getIntegral() const {return m_integral; }

		/** Sets the integral expressed by the argument
		 *
		 * \param   val   Integral expressed by argument
		 */
		void setIntegral(long long val){ m_integral = val; }

	protected:
		long long m_integral;

	};

	/** Represents a C++ template template argument AST node
	*/
	class ASTObject_TemplateTemplateArgument: public ASTObject_TemplateArgument
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateTemplateArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TEMPLATE_ARGUMENT; }

		/** Returns the template AST node expressed by the argument
		 *
		 * \return   Template AST node expressed by argument
		 */
		ASTObject* getTemplate() const { return m_template; }

		/** Sets the template AST node expressed by the argument
		 *
		 * \param   templ   Template AST node expressed by argument
		 */
		void setTemplate(ASTObject* templ){ m_template = templ; }

	protected:
		ASTObject* m_template;

	};

	/** Represents a C++ template template expansion argument AST node
	*/
	class ASTObject_TemplateTemplateExpansionArgument: public ASTObject_TemplateArgument
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateTemplateExpansionArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TEMPLATE_EXPANSION_ARGUMENT; }

	};

	/** Represents a C++ template expression argument AST node
	*/
	class ASTObject_TemplateExpressionArgument: public ASTObject_TemplateArgument
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateExpressionArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_EXPRESSION_ARGUMENT; }

	};

	/** Represents a C++ template pack argument AST node
	*/
	class ASTObject_TemplatePackArgument: public ASTObject_TemplateArgument
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplatePackArgument(const std::string& nodeName)
			: ASTObject_TemplateArgument(nodeName){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_PACK_ARGUMENT; }

	};

	


}

#endif // __ASTOBJECT_TEMPLATEARGUMENT_HPP__