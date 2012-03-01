#ifndef __ASTOBJECT_VARIABLE_DECL_HPP__
#define __ASTOBJECT_VARIABLE_DECL_HPP__

#include <string>
#include "ASTObject.hpp"
#include "ASTType.hpp"

namespace CPPAnalyzer
{
	/** Represents a C variable declaration AST node (excluding static data members)
	*/
	class ASTObject_Variable_Decl: public ASTObject
	{
	public:
		
		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Variable_Decl(const std::string& nodeName)
			: ASTObject(nodeName), m_type(NULL)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_VARIABLE_DECL; }


		/** Returns the type of the variable
		 *
		 * \return   Type of the variable
		 */
		ASTType* getType() const { return m_type; }
		
		/** Sets the type of the variable
		 *
		 * \param   theType   Type of the variable
		 */

		void setType(ASTType* theType){ m_type = theType; }

	protected:
		ASTType* m_type;
	};


}

#endif // __ASTOBJECT_VARIABLE_DECL_HPP__