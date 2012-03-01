#ifndef __ASTOBJECT_HPP__
#define __ASTOBJECT_HPP__

#include <string>
#include <vector>
#include "ASTObjectKinds.hpp"

namespace CPPAnalyzer
{
	/** Represents a location in the source code
	 */
	struct ASTObject_SourceLocation
	{
		std::string fileName;
		unsigned int line;
		unsigned int column;
	};

	/** Represents a basic object in the AST
	 */
	class ASTObject
	{
	public:
		
		/** Constructor
		 *
		 * \param 	nodeName Name of the node
		 */
		ASTObject(const std::string& nodeName)
			: m_id(ASTObject::count+1),m_nodeName(nodeName), m_usr(""), m_parent(NULL), m_isDefinition(false)
		{
			++ASTObject::count;
		}

		/** Destructor
		 */
		virtual ~ASTObject(){}

		/** Returns the kind of this ASTObject
		 *
		 * \return   Kind of the ASTObject
		 */
		virtual ASTObjectKind getKind() const { return KIND_INVALID; }

		/** Returns the ID of the ASTObject
		 *
		 * \return   ID of the ASTObject
		 */
		unsigned getID() const { return m_id; }
		
		/** Returns the USR - a string that can be used to reference ASTObject from 
		 *  different translation units
		 *
		 * \return   USR
		 */
		const std::string& getUSR() const { return m_usr; }

		/** Sets the USR
		 *
		 * \param   usr   USR
		 */
		void setUSR(const std::string& usr) { m_usr = usr; }

		/** Returns the display name
		 *
		 * \return   Display name
		 */
		const std::string& getDisplayName() const { return m_displayName; }

		/** Sets the display name
		 *
		 * \param   val   display name
		 */
		void setDisplayName(const std::string& val) { m_displayName = val; }

		/** Returns the node name
		 *
		 * \return   Node name
		 */
		const std::string& getNodeName() const { return m_nodeName; }

		/** Returns the parent ASTObject
		 *
		 * \return   Parent ASTObject
		 */
		ASTObject* getParent() const { return m_parent; }

		/** Sets the parent ASTObject
		 *
		 * \param   parent   Parent ASTObject
		 */
		void setParent(ASTObject* parent) { m_parent = parent; }

		/** Returns a vector with the children ASTObjects
		 *
		 * \return   Vector with children ASTObjects
		 */
		std::vector<ASTObject*>& getChildren(){ return m_children; }

		/** Returns a vector with the children ASTObjects
		 *
		 * \return   Vector with children ASTObjects
		 */
		const std::vector<ASTObject*>& getChildren() const { return m_children; }
		
		/** Adds the given ASTObject as a child
		 *
		 * \param   child   ASTObject to add as child
		 */
		void addChild(ASTObject* child){ 
			child->setParent(this); 
			m_children.push_back(child);
		}

		// TODO: removeChild

		/** Returns if this ASTObject is a definition or only a declaration
		 *
		 * \return   True if it is definition, otherwise false
		 */
		bool isDefinition(){return m_isDefinition;}

		/** Returns the source code location of the definition
		 *
		 * \return   Source code location of definition
		 */
		const ASTObject_SourceLocation& getDefinitionSource() const { return m_definitionSource; }

		/** Returns a vector of source code locations of all the declarations
		 *
		 * \return   Source code locations of declarations
		 */
		const std::vector<ASTObject_SourceLocation>& getDeclarationsSource() const { return m_declarationsSource; }

		/** Sets the source code location of the definition
		 *
		 * \param   location   Source code location of definition
		 */
		void setDefinition(ASTObject_SourceLocation location)
		{
			m_isDefinition = true;
			m_definitionSource = location;
		}

		/** Adds the source code location of a declaration
		 *
		 * \param   location   Source code location of a declaration
		 */
		void addDeclaration(ASTObject_SourceLocation location)
		{
			m_declarationsSource.push_back(location);
		}


	protected:
		/** Counter for IDs
		 */
		static unsigned count;

		unsigned m_id;

		std::string m_nodeName;

		std::string m_displayName;

		/** USR for referencing the ASTObject across translation units
		 */
		std::string m_usr;

		std::vector<ASTObject_SourceLocation> m_declarationsSource;	// TODO: use pointers?
		ASTObject_SourceLocation m_definitionSource;

		bool m_isDefinition;

		ASTObject* m_parent;
		std::vector<ASTObject*> m_children;
	};

	
}

#endif // __ASTOBJECT_HPP__
