#ifndef __ASTOBJECT_STRUCT_HPP__
#define __ASTOBJECT_STRUCT_HPP__

#include <string>
#include <vector>
#include "ASTObject.hpp"
#include "ASTObjectHelper_Template.hpp"

namespace CPPAnalyzer
{
	class ASTObject_Member_Function;
	class ASTObject_Constructor;
	class ASTObject_Destructor;
	class ASTObject_Struct;

	/** Represents base class information
	*/
	struct AST_BaseStruct
	{
		ASTObjectAccess access;
		ASTObject_Struct* base;
	};

	/** Represents a C/C++ struct AST node
	*/
	class ASTObject_Struct: public ASTObject
	{
	public:
		
		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject_Struct(const std::string& nodeName)
			: ASTObject(nodeName), m_destructor(NULL)
		{

		}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_STRUCT; }

		/** Sets the destructor
		 *
		 * \param 	destructor   Destructor AST node
		 */
		void setDestructor(ASTObject_Destructor* destructor);

		/** Adds a new constructor
		 *
		 * \param 	constructor   Constructor AST node to add
		 */
		void addConstructor(ASTObject_Constructor* constructor);

		/** Adds a new base
		 *
		 * \param 	base     Base ASTObject
		 * \param   access   Type of inheritence
		 */
		void addBase(ASTObject_Struct* base, ASTObjectAccess access);

		/** Returns a vector of all bases
		 *
		 * \return   Information about base classes
		 */
		const std::vector<AST_BaseStruct>& getBases() const { return m_bases; };

		/** Returns the template information
		 *
		 * \return   Template information
		 */
		ASTObjectHelper_Template& getTemplateInfo(){ return m_templateInfo; }

		/** Returns the template information
		 *
		 * \return   Template information
		 */
		const ASTObjectHelper_Template& getTemplateInfo() const { return m_templateInfo; }

	protected:

		ASTObject_Destructor* m_destructor;
		std::vector<ASTObject_Constructor*> m_constructors;
		std::vector<ASTObject_Member_Function*> m_functions;
		std::vector<AST_BaseStruct> m_bases;
		ASTObjectHelper_Template m_templateInfo;
	};


}

#endif // __ASTOBJECT_STRUCT_HPP__