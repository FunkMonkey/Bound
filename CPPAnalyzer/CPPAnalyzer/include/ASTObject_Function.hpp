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

	/** Represents a C function AST node
	*/
	class ASTObject_Function: public ASTObject
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Function(const std::string& nodeName)
			: ASTObject(nodeName), m_returnType(NULL)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_FUNCTION; }

		/** Returns the return type of the function
		 *
		 * \return   Return type of the function
		 */
		ASTType* getReturnType() const { return m_returnType; }

		/** Sets the return type of the function
		 *
		 * \param   theType   Return type of the function
		 */
		void setReturnType(ASTType* theType){ m_returnType = theType; }

		/** Adds a parameter AST node as a child
		 *
		 * \param   param   Parameter AST node to add
		 */
		void addParameter(ASTObject_Parameter* param);

		/** Returns a vector with all children parameter AST nodes
		 *
		 * \return   Parameters of the function
		 */
		const std::vector<ASTObject_Parameter*>& getParameters() const { return m_parameters; }

		// TODO:  removeParam

		/** Returns the template information
		 *
		 * \return   Template information
		 */
		ASTObjectHelper_Template& getTemplateInfo(){ return m_templateInfo; }

		/** Returns the template information
		 *
		 * \return   Template information
		 */
		const ASTObjectHelper_Template& getTemplateInfo() const { return m_templateInfo; }

		/** Sets the template information
		 *
		 * \param   val   Template information
		 */
		void setTemplateInfo(const ASTObjectHelper_Template& val) { m_templateInfo = val; }

	protected:
		ASTType* m_returnType;

		std::vector<ASTObject_Parameter*> m_parameters;
		// TODO: function-type

		ASTObjectHelper_Template m_templateInfo;
		
	};


}

#endif // __ASTOBJECT_FUNCTION_HPP__