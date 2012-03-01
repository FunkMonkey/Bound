#ifndef __CLANG_AST_CXTREE_HPP__
#define __CLANG_AST_CXTREE_HPP__

#include <clang-c/index.h>
#include <vector>
#include <string>
#include <set>

namespace CPPAnalyzer
{
	class ASTObject;

	/** Represents the types of visibility (for processing)
	 */
	enum CXTreeNode_Visibility
	{
		VISIBILITY_NONE,
		VISIBILITY_VISIBLE,
		VISIBILITY_REFERENCED
	};

	/** Represents a tree node in the intermediate AST
	 */
	class Clang_AST_CXTreeNode
	{
		public:
			/** Constructor
			 *
			 * \param   parent   Parent node
			 */
			explicit Clang_AST_CXTreeNode(Clang_AST_CXTreeNode* parent = nullptr)
				: m_parentNode(parent), m_astObject(nullptr), m_visibility(VISIBILITY_NONE), m_fullName("")
			{
				m_canonicalCursor = clang_getNullCursor();
			}

			// TODO: destructor with TreeNode and ASTobject cleanup

			/** Returns the parent node
			 *
			 * \return  Parent node
			 */
			Clang_AST_CXTreeNode* getParentNode() const { return m_parentNode; }

			/** Sets the parent node
			 *
			 * \param   val   Parent node
			 */
			void setParentNode(Clang_AST_CXTreeNode* val) { m_parentNode = val; calculateFullName(); }

			/** Returns the canonical cursor
			 *
			 * \return  Canonical cursor
			 */
			CXCursor getCanonicalCursor() const { return m_canonicalCursor; }

			/** Sets the canonical cursor
			 *
			 * \param  val  Canonical cursor
			 */
			void setCanonicalCursor(CXCursor val) { m_canonicalCursor = val; }

			/** Returns the ASTObject associated with this tree node
			 *
			 * \return  ASTObject
			 */
			ASTObject* getASTObject() const { return m_astObject; }

			/** Sets the ASTObject associated with this tree node
			 *
			 * \param  val  ASTObject
			 */
			void setASTObject(ASTObject* val) { m_astObject = val; }

			/** Returns a vector of cursors associated with this tree node
			 *
			 * \return  Cursors
			 */
			const std::vector<CXCursor>& getCursors() const { return m_cursors; }
			std::vector<CXCursor>& getCursors() { return m_cursors; }

			/** Returns the visibility of the tree node (for processing)
			 *
			 * \return  Visibility
			 */
			CXTreeNode_Visibility getVisibility() const { return m_visibility; }

			/** Returns the visibility of the tree node (for processing)
			 *
			 * \param  val  Visibility
			 */
			void setVisibility(CXTreeNode_Visibility val) { m_visibility = val; }

			/** Returns the full name of the tree node (for processing)
			 *
			 * \return  Full name
			 */
			const std::string& getFullName() const { return m_fullName; }

			/** Returns a set of files that declare this tree node (for processing)
			 *
			 * \return  Files this AST object is declared in
			 */
			const std::set<std::string>& getFileNames() const { return m_fileNames; }

			/** Adds a cursor declaration to this tree node
			 *
			 * \param   cursor   Cursor to add
			 */
			void addCursor(CXCursor cursor);

			/** Adds a child node to this tree node
			 *
			 * \param   node   Child node to add
			 */
			void addChild(Clang_AST_CXTreeNode* node);

			/** Returns a vector of children nodes
			 *
			 * \return Child nodes
			 */
			const std::vector<Clang_AST_CXTreeNode*>& getChildren() const { return m_children; }

		protected:

			/** Calculates the full name based on the parent chain
			 */
			void calculateFullName();

			Clang_AST_CXTreeNode* m_parentNode;
			std::vector<Clang_AST_CXTreeNode*> m_children;
			CXCursor              m_canonicalCursor;
			ASTObject*            m_astObject;
			std::vector<CXCursor> m_cursors;

			CXTreeNode_Visibility m_visibility;
			std::string           m_fullName;

			std::set<std::string> m_fileNames;
			
	};
}

#endif // __CLANG_AST_CXTREE_HPP__
