#ifndef __ASTOBJECT_PARAMETER_HPP__
#define __ASTOBJECT_PARAMETER_HPP__

#include "ASTObject_Variable_Decl.hpp"

namespace CPPAnalyzer
{
	/** Represents a C function parameter AST node
	*/
	class ASTObject_Parameter: public ASTObject_Variable_Decl
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Parameter(const std::string& nodeName)
			: ASTObject_Variable_Decl(nodeName)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_PARAMETER; }

	};


}

#endif // __ASTOBJECT_PARAMETER_HPP__