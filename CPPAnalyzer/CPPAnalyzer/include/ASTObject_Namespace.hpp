#ifndef __ASTOBJECT_NAMESPACE_HPP__
#define __ASTOBJECT_NAMESPACE_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	/** Represents a C++ namespace AST node
	*/
	class ASTObject_Namespace: public ASTObject
	{
	public:

		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Namespace(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_NAMESPACE; }

		/** Checks if it is an anonymous namespace
		 *
		 * \return   True if anonymous, otherwise false
		 */
		bool isAnonymous(){ return this->m_nodeName == ""; }
	};


}

#endif // __ASTOBJECT_NAMESPACE_HPP__
