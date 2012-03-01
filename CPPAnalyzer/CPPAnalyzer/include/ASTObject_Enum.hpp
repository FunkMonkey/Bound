#ifndef __ASTOBJECT_ENUM_HPP__
#define __ASTOBJECT_ENUM_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"

namespace CPPAnalyzer
{
	/** Represents a C enum AST node
	*/
	class ASTObject_Enum: public ASTObject
	{
	public:
		
		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Enum(const std::string& nodeName)
			: ASTObject(nodeName)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_ENUM; }

	protected:

	};

	/** Represents a C enum constant AST node
	*/
	class ASTObject_EnumConstant: public ASTObject
	{
	public:
		
		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_EnumConstant(const std::string& nodeName)
			: ASTObject(nodeName), m_value(0)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_ENUMCONSTANT; }

		// TODO: support unsigned values
		/** Returns the integer representation
		 *
		 * \return  Integer representation
		 */
		long long getValue() const { return m_value; }

		/** Sets the integer representation
		 *
		 * \param 	val   Integer representation
		 */
		void setValue(long long val){m_value = val; }

	protected:
		long long m_value;
	};


}

#endif // __ASTOBJECT_ENUM_HPP__