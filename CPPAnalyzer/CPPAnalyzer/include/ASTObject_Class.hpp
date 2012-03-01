#ifndef __ASTOBJECT_CLASS_HPP__
#define __ASTOBJECT_CLASS_HPP__

#include "ASTObject_Struct.hpp"

namespace CPPAnalyzer
{
	/** Represents a C++ class AST node
	 *     - only extended struct for own kind
	*/
	class ASTObject_Class: public ASTObject_Struct
	{
	public:
		
		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Class(const std::string& nodeName)
			: ASTObject_Struct(nodeName)
		{
		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_CLASS; }
	};


}

#endif // __ASTOBJECT_CLASS_HPP__