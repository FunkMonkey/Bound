#ifndef __ASTOBJECT_DESTRUCTOR_HPP__
#define __ASTOBJECT_DESTRUCTOR_HPP__

#include "ASTObject_Member_Function.hpp"

namespace CPPAnalyzer
{
	/** Represents a C++ destructor AST node
	*/
	class ASTObject_Destructor: public ASTObject_Member_Function
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Destructor(const std::string& nodeName)
			: ASTObject_Member_Function(nodeName)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_DESTRUCTOR; }

	protected:
	};


}

#endif // __ASTOBJECT_DESTRUCTOR_HPP__