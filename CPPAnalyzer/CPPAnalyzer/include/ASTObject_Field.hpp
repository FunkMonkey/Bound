#ifndef __ASTOBJECT_FIELD_HPP__
#define __ASTOBJECT_FIELD_HPP__

#include "ASTObject_Variable_Decl.hpp"

namespace CPPAnalyzer
{
	/** Represents a C/C++ field AST node (including static data members)
	*/
	class ASTObject_Field: public ASTObject_Variable_Decl
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Field(const std::string& nodeName)
			: ASTObject_Variable_Decl(nodeName), m_isStatic(false)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_FIELD; }

		/** Returns the access (private, protected, public)
		 *
		 * \return   Access
		 */
		ASTObjectAccess getAccess() const { return m_access; }

		/** Sets the access (private, protected, public)
		 *
		 * \param   acc   Access
		 */
		void setAccess(ASTObjectAccess acc){ m_access = acc; }

		/** Checks if field is static
		 *
		 * \return   True if static, otherwise false
		 */
		bool isStatic() const { return m_isStatic; }

		/** Sets the static state
		 *
		 * \param   val  True for static, otherwise false
		 */
		void setStatic(bool val){ m_isStatic = val; }

	protected:
		ASTObjectAccess m_access;
		bool m_isStatic;
	};


}

#endif // __ASTOBJECT_FIELD_HPP__