#ifndef __ASTOBJECT_TYPEDEF_HPP__
#define __ASTOBJECT_TYPEDEF_HPP__

#include "ASTObject.hpp"
#include "ASTType.hpp"

namespace CPPAnalyzer
{
	/** Represents a C++ typedef AST node
	*/
	class ASTObject_Typedef: public ASTObject
	{
	public:
		
		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Typedef(const std::string& nodeName)
			: ASTObject(nodeName), m_type(NULL)
		{
		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_TYPEDEF; }

		/** Returns the type the typedef references
		 *
		 * \return   Type the typedef references
		 */
		ASTType* getType() const { return m_type; }

		/** Sets the type the typedef references
		 *
		 * \param   theType   Type the typedef references
		 */
		void setType(ASTType* theType){ m_type = theType; }

	protected:
		ASTType* m_type;
	};


}

#endif // __ASTOBJECT_TYPEDEF_HPP__