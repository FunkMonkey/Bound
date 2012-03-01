#ifndef __AST_TYPE_HPP__
#define __AST_TYPE_HPP__

#include <string>
#include <vector>

namespace CPPAnalyzer
{
	class ASTObject;

	/** Represents a type that may be referenced by AST nodes
	 */
	class ASTType
	{

	public:
		
		/** Constructor
		 */
		ASTType()
			: m_id(ASTType::count+1), m_pointsTo(NULL), m_decl(NULL), m_isConst(false), m_canonicalType(nullptr)
		{
			++ASTType::count;
		}

		/** Returns the ID of the AST type
		 */
		unsigned getID() const { return m_id; }

		/** Returns the declaration the type uses
		 *
		 * \return 	Declaration of the type
		 */
		ASTObject* getDeclaration() const { return m_decl; }
		
		/** Sets the declaration the type uses
		 *
		 * \param   decl 	Declaration of the type
		 */
		void setDeclaration(ASTObject* decl){m_decl = decl;}

		/** Returns the kind of the type
		 *
		 * \return 	Kind of the type
		 */
		const std::string& getKind() const { return m_kind; }

		/** Sets the kind of the type
		 *
		 * \param   kind 	Kind of the type
		 */
		void setKind(const std::string& kind){m_kind = kind;}

		/** Returns the type this pointer or reference type points to
		 *
		 * \return 	Pointee type
		 */
		ASTType* getPointsTo() const { return m_pointsTo; }
		
		/** Sets the type this pointer or reference type points to
		 *
		 * \param   theType 	Pointee type
		 */
		void setPointsTo(ASTType* theType){m_pointsTo = theType;}

		/** Checks, if type is const qualified
		 *
		 * \return 	True if const qualified, otherwise false
		 */
		bool isConst() const { return m_isConst; }

		/** Sets the const qualified state
		 *
		 * \param   isConst   const state of the 
		 */
		void setConst(bool isConst){ m_isConst = isConst; }

		/** Checks, if type is canonical (completely desugared)
		 *
		 * \return 	True if canonical, otherwise false
		 */
		bool isCanonical() const { return (m_canonicalType == nullptr); }

		/** Returns the canonical type of this type (null if already canonical)
		 *
		 * \return 	Canonical type
		 */
		ASTType* getCanonicalType() const { return m_canonicalType; }

		/** Sets the canonical type of this sugared type
		 *
		 * \param   val 	Canonical type
		 */
		void setCanonicalType(ASTType* val) { m_canonicalType = val; }

		/** Returns a vector of the parameters of this function type
		 *
		 * \return 	Function type parameters
		 */
		const std::vector<ASTType*>& getParameters() const { return m_parameters; }
		
		/** Adds a parameter  type to this function type
		 *
		 * \param   param   Parameter type to be added
		 */
		void addParameter(ASTType* param)
		{
			m_parameters.push_back(param);
		}

	protected:
		/** Counter for IDs
		 */
		static unsigned count;
		unsigned m_id;

		std::string m_kind; // TODO: use enum
		ASTType* m_pointsTo;
		ASTObject* m_decl;
		bool m_isConst;
		ASTType* m_canonicalType;

		std::vector<ASTType*> m_parameters;
	};
}

#endif // __AST_TYPE_HPP__