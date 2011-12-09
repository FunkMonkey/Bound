#ifndef __AST_TYPE_HPP__
#define __AST_TYPE_HPP__

#include <string>

namespace CPPAnalyzer
{
	class ASTObject;

	class ASTType
	{

	public:
		

		ASTType()
			: m_pointsTo(NULL), m_decl(NULL), m_isConst(false)
		{

		}

		virtual ~ASTType()
		{
			// The type cleans itself up
			if(m_pointsTo)
			{
				delete m_pointsTo;
				m_pointsTo = NULL;
			}
		}

		ASTObject* getDeclaration() const { return m_decl; }
		void setDeclaration(ASTObject* decl){m_decl = decl;}

		const std::string& getKind() const { return m_kind; }
		void setKind(const std::string& kind){m_kind = kind;}

		ASTType* getPointsTo() const { return m_pointsTo; }
		void setPointsTo(ASTType* theType){m_pointsTo = theType;}

		bool isConst() const { return m_isConst; }
		void setConst(bool isConst){ m_isConst = isConst; }

	protected:
		std::string m_kind; // TODO: use enum
		ASTType* m_pointsTo;
		ASTObject* m_decl;
		bool m_isConst;

	};


}

#endif // __AST_TYPE_HPP__