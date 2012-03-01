#ifndef __ASTOBJECT_MEMBER_FUNCTION_HPP__
#define __ASTOBJECT_MEMBER_FUNCTION_HPP__

#include "ASTObject_Function.hpp"

namespace CPPAnalyzer
{
	/** Represents a C++ membe function AST node
	*/
	class ASTObject_Member_Function: public ASTObject_Function
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Member_Function(const std::string& nodeName)
			: ASTObject_Function(nodeName), m_isVirtual(false), m_isConst(false), m_isStatic(false)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_MEMBER_FUNCTION; }

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

		/** Checks if function is declared as virtual
		 *
		 * \return   True if virtual, otherwise false
		 */
		bool isVirtual() const { return m_isVirtual; }

		/** Sets the virtual state
		 *
		 * \param   val  True for virtual, otherwise false
		 */
		void setVirtual(bool val){ m_isVirtual = val; }

		/** Checks if function is declared as static
		 *
		 * \return   True if static, otherwise false
		 */
		bool isStatic() const { return m_isStatic; }

		/** Sets the static state
		 *
		 * \param   val  True for static, otherwise false
		 */
		void setStatic(bool val){ m_isStatic = val; }

		/** Checks if function is declared as const
		 *
		 * \return   True if static, otherwise false
		 */
		bool isConst() const { return m_isConst; }

		/** Sets the const state
		 *
		 * \param   val  True for const, otherwise false
		 */
		void setConst(bool isConst){ m_isConst = isConst; }

	protected:
		ASTObjectAccess m_access;
		bool m_isVirtual;
		bool m_isConst;
		bool m_isStatic;
	};


}

#endif // __ASTOBJECT_MEMBER_FUNCTION_HPP__