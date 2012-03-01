#ifndef __ASTOBJECT_CONSTRUCTOR_HPP__
#define __ASTOBJECT_CONSTRUCTOR_HPP__

#include "ASTObject_Member_Function.hpp"

namespace CPPAnalyzer
{
	/** Represents a C++ constructor AST node
	*/
	class ASTObject_Constructor: public ASTObject_Member_Function
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Constructor(const std::string& nodeName)
			: ASTObject_Member_Function(nodeName)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_CONSTRUCTOR; }

	protected:
	};


}

#endif // __ASTOBJECT_CONSTRUCTOR_HPP__