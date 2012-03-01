#ifndef __ASTOBJECT_UNION_HPP__
#define __ASTOBJECT_UNION_HPP__

#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	/** Represents a C++ union AST node
	*/
	class ASTObject_Union: public ASTObject
	{
	public:
		
		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Union(const std::string& nodeName)
			: ASTObject(nodeName)
		{
		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_UNION; }
	};


}

#endif // __ASTOBJECT_UNION_HPP__