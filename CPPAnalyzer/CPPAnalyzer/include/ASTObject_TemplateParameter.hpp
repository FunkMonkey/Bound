#ifndef __ASTOBJECT_TEMPLATEPARAMETER_HPP__
#define __ASTOBJECT_TEMPLATEPARAMETER_HPP__

#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	/** Represents a C++ template parameter AST node
	*/
	class ASTObject_TemplateParameter: public ASTObject
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateParameter(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}
	};

	/** Represents a C++ template type parameter AST node
	*/
	class ASTObject_TemplateTypeParameter: public ASTObject_TemplateParameter
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateTypeParameter(const std::string& nodeName)
			: ASTObject_TemplateParameter(nodeName)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TYPE_PARAMETER; }

	};

	/** Represents a C++ template non type parameter AST node
	*/
	class ASTObject_TemplateNonTypeParameter: public ASTObject_TemplateParameter
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateNonTypeParameter(const std::string& nodeName)
			: ASTObject_TemplateParameter(nodeName)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_NON_TYPE_PARAMETER; }

	};

	/** Represents a C++ template template parameter AST node
	*/
	class ASTObject_TemplateTemplateParameter: public ASTObject_TemplateParameter
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_TemplateTemplateParameter(const std::string& nodeName)
			: ASTObject_TemplateParameter(nodeName)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TEMPLATE_TEMPLATE_PARAMETER; }

	};


}

#endif // __ASTOBJECT_TEMPLATEPARAMETER_HPP__