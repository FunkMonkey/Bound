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

	struct AST_BaseStruct
	{
		ASTObjectAccess access;
		ASTObject_Struct* base;
	};

	class ASTObject_Struct: public ASTObject
	{
	public:
		
		ASTObject_Struct(const std::string& nodeName)
			: ASTObject(nodeName), m_destructor(NULL), m_currAccess(ACCESS_PUBLIC)
		{

		}

		virtual ASTObjectKind getKind() const { return KIND_STRUCT; }

		void setDestructor(ASTObject_Destructor* destructor);
		void addConstructor(ASTObject_Constructor* constructor);

		ASTObjectAccess getCurrentAccess() const { return m_currAccess; }
		void setCurrentAccess(ASTObjectAccess acc){ m_currAccess = acc; }

		void addBase(ASTObject_Struct* base, ASTObjectAccess access);
		const std::vector<AST_BaseStruct>& getBases() const { return m_bases; };

		ASTObjectHelper_Template& getTemplateInfo(){ return m_templateInfo; }
		const ASTObjectHelper_Template& getTemplateInfo() const { return m_templateInfo; }

	protected:

		ASTObject_Destructor* m_destructor;
		std::vector<ASTObject_Constructor*> m_constructors;
		std::vector<ASTObject_Member_Function*> m_functions;
		ASTObjectAccess m_currAccess;
		std::vector<AST_BaseStruct> m_bases;
		ASTObjectHelper_Template m_templateInfo;
	};


}

#endif // __ASTOBJECT_STRUCT_HPP__