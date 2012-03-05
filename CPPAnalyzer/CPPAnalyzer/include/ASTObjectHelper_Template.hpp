#ifndef __ASTOBJECTHELPER_TEMPLATE_HPP__
#define __ASTOBJECTHELPER_TEMPLATE_HPP__

#include "ASTObjectKinds.hpp"
#include <vector>

namespace CPPAnalyzer
{
	class ASTObject_TemplateParameter;
	class ASTObject_TemplateArgument;

	// TODO: rename to AST_TemplateInfo
	/** Represents template information for classes and functions
	*/
	class ASTObjectHelper_Template
	{
	public:

		/** Constructor
		 */
		ASTObjectHelper_Template()
			:m_kind(TEMPLATE_KIND_NON_TEMPLATE), m_templateDecl(nullptr)
		{

		}

		/** Returns the kind of the template
		 *
		 * \return 	Kind of the template
		 */
		ASTObjectTemplateKind getKind() const { return m_kind; }

		/** Sets the kind of the template
		 *
		 * \param   kind 	Kind of the template
		 */
		void setKind(ASTObjectTemplateKind kind) { m_kind = kind; }

		/** Returns a vector of template parameters
		 *
		 * \return 	Template parameters
		 */
		const std::vector<ASTObject_TemplateParameter*>& getParameters() const { return m_parameters; }
		
		/** Adds a template parameter
		 *
		 * \param   param 	Template parameter AST node to add
		 */
		void addParameter(ASTObject_TemplateParameter* param){ m_parameters.push_back(param); }

		/** Returns a vector of template arguments
		 *
		 * \return 	Template arguments
		 */
		const std::vector<ASTObject_TemplateArgument*>& getArguments() const { return m_arguments; }

		/** Adds a template argument
		 *
		 * \param   param 	Template argument AST node to add
		 */
		void addArgument(ASTObject_TemplateArgument* param){ m_arguments.push_back(param); }

		/** Returns the template declaration
		 *
		 * \return 	Template declaration
		 */
		ASTObject* getTemplateDeclaration() const { return m_templateDecl; }

		/** Sets the template declaration
		 *
		 * \param   templDecl 	Template declaration
		 */
		void setTemplateDeclaration(ASTObject* templDecl){ m_templateDecl = templDecl; }


	protected:

		ASTObjectTemplateKind m_kind;
		std::vector<ASTObject_TemplateParameter*> m_parameters;
		std::vector<ASTObject_TemplateArgument*> m_arguments;
		ASTObject* m_templateDecl;
		

	};


}

#endif // __ASTOBJECTHELPER_TEMPLATE_HPP__