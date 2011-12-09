#ifndef __ASTOBJECT_HPP__
#define __ASTOBJECT_HPP__

#include <string>
#include <vector>
#include "ASTObjectKinds.hpp"

namespace CPPAnalyzer
{
	class ASTObject
	{
	public:
		ASTObject(const std::string& nodeName)
			: m_id(ASTObject::count+1),m_nodeName(nodeName), m_usr(""), m_parent(NULL)
		{
			++ASTObject::count;
		}

		ASTObject(const std::string& nodeName, const std::string& usr)
			: m_nodeName(nodeName), m_usr(usr), m_parent(NULL)
		{
			
		}

		virtual ~ASTObject(){}

		virtual ASTObjectKind getKind() const { return KIND_INVALID; }

		unsigned getID() const { return m_id; }
		
		const std::string& getUSR() const { return m_nodeName; }
		const std::string& getNodeName() const { return m_nodeName; }
		const std::string& getLongName() const { return m_longName; }
		const std::string& getKindName() const { return m_longName; }

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
		static unsigned count;
		unsigned m_id;
		std::string m_nodeName;
		std::string m_usr;
		std::string m_longName;

		

		ASTObject* m_parent;
		std::vector<ASTObject*> m_children;
	};

	
}

#endif // __ASTOBJECT_HPP__
