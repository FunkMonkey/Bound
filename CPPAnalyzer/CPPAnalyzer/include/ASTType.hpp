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

			for(auto it = m_parameters.begin(), end = m_parameters.end(); it != end; ++it)
				delete *it;

			for(auto it = m_parametersCanonical.begin(), end = m_parametersCanonical.end(); it != end; ++it)
				delete *it;
		}

		ASTObject* getDeclaration() const { return m_decl; }
		void setDeclaration(ASTObject* decl){m_decl = decl;}

		const std::string& getKind() const { return m_kind; }
		void setKind(const std::string& kind){m_kind = kind;}

		ASTType* getPointsTo() const { return m_pointsTo; }
		void setPointsTo(ASTType* theType){m_pointsTo = theType;}

		bool isConst() const { return m_isConst; }
		void setConst(bool isConst){ m_isConst = isConst; }

		const std::vector<ASTType*>& getParameters() const { return m_parameters; }
		const std::vector<ASTType*>& getParametersCanonical() const { return m_parametersCanonical; }
		
		void addParameter(ASTType* param)
		{
			m_parameters.push_back(param);
		}

		void addParameterCanonical(ASTType* param)
		{
			m_parametersCanonical.push_back(param);
		}

	protected:
		std::string m_kind; // TODO: use enum
		ASTType* m_pointsTo;
		ASTObject* m_decl;
		bool m_isConst;

		std::vector<ASTType*> m_parameters;
		std::vector<ASTType*> m_parametersCanonical;
	};
}

#endif // __AST_TYPE_HPP__