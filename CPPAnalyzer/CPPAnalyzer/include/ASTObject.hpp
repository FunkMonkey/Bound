#ifndef __ASTOBJECT_HPP__
#define __ASTOBJECT_HPP__

#include <string>
#include <vector>
#include "ASTObjectTypes.hpp"

namespace CPPAnalyzer
{
	class ASTObject
	{
	public:
		ASTObject(ASTObjectType type, const std::string& nodeName)
			: m_type(type), m_nodeName(nodeName), m_usr(""), m_parent(NULL)
		{

		}

		ASTObject(ASTObjectType type, const std::string& nodeName, const std::string& usr)
			: m_type(type), m_nodeName(nodeName), m_usr(usr), m_parent(NULL)
		{
			
		}

		virtual ~ASTObject(){}

		
		const std::string& getUSR() const { return m_nodeName; }
		const std::string& getNodeName() const { return m_nodeName; }
		const std::string& getLongName() const { return m_longName; }

		ASTObjectType getType() const { return m_type; }
		ASTObject* getParent() const { return m_parent; }
		void setParent(ASTObject* parent) { m_parent = parent; }

		void calculateLongNameFromCache()
		{
			if(m_parent)
				m_longName = m_parent->getLongName();
			
			m_longName += std::string("::") + m_nodeName;
		}

		void calculateLongName()
		{
			if(m_parent)
				m_longName = m_parent->getLongName();

			m_longName += std::string("::") + m_nodeName;
		}


		std::vector<ASTObject*>& getChildren(){ return m_children; }
		const std::vector<ASTObject*>& getChildren() const { return m_children; }
		void addChild(ASTObject* child){ child->setParent(this); m_children.push_back(child); }

		// TODO: removeChild


	protected:
		ASTObjectType m_type;
		std::string m_nodeName;
		std::string m_usr;
		std::string m_longName;

		ASTObject* m_parent;
		std::vector<ASTObject*> m_children;

	};


}

#endif // __ASTOBJECT_HPP__
