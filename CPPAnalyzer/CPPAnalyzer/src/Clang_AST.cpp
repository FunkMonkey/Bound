
#include "Clang_AST.hpp"

#include "ASTObject_Namespace.hpp"
#include "ASTObject_Struct.hpp"
#include "ASTObject_Class.hpp"
#include "ASTObject_Field.hpp"
#include "ASTObject_Function.hpp"
#include "ASTObject_Member_Function.hpp"
#include "ASTObject_Parameter.hpp"
#include "ASTObject_Constructor.hpp"
#include "ASTObject_Destructor.hpp"
#include "ASTObject_Typedef.hpp"
#include "ASTObject_Enum.hpp"
#include "ASTObject_TemplateArgument.hpp"
#include "ASTObject_TemplateParameter.hpp"

#include <iostream>
#include <assert.h>

using std::string;
using std::vector;

// TODO: move
#include <sstream>

template <class T>
inline std::string to_string (const T& t)
{
	std::stringstream ss;
	ss << t;
	return ss.str();
}


namespace CPPAnalyzer
{
	std::string CXStringToStdStringAndFree(CXString cxString)
	{
		std::string result(clang_getCString(cxString));
		clang_disposeString(cxString);
		return result;
	}

	ASTObject_SourceLocation getSourceLocation(CXCursor cursor)
	{
		auto cursorLocation = clang_getCursorLocation(cursor);
		auto cursorRange = clang_getCursorExtent(cursor);

		CXFile file;
		unsigned line, column, offset;
		clang_getExpansionLocation(cursorLocation, &file, &line, &column, &offset);

		ASTObject_SourceLocation location;

		if(file)
		{
			location.fileName = CXStringToStdStringAndFree(clang_getFileName(file));
			location.line = line;
			location.column = column;
		}

		// TODO: etc

		return location;
		
		// ranges ...
		/*CXSourceRange range = clang_getCursorExtent(cursor);
		CXSourceLocation startLocation = clang_getRangeStart(range);
		CXSourceLocation endLocation = clang_getRangeEnd(range);

		CXFile file;
		unsigned int line, column, offset;
		clang_getInstantiationLocation(startLocation, &file, &line, &column, &offset);
		printf("Start: Line: %u Column: %u Offset: %u\n", line, column, offset);
		clang_getInstantiationLocation(endLocation, &file, &line, &column, &offset);
		printf("End: Line: %u Column: %u Offset: %u\n", line, column, offset);*/
	}


	Clang_AST::Clang_AST(CXCursor translationUnit)
	: m_rootCursor(translationUnit)
	{
		m_rootASTObject = new ASTObject_Namespace("");
		m_astObjects.insert(std::pair<CXCursor, ASTObject*>(m_rootCursor, m_rootASTObject));

		//m_usrASTObjects.insert(std::pair<CXCursor, ASTObject*>(m_rootCursor, m_rootASTObject));
	}


	ASTObject* Clang_AST::getASTObjectFromCursor(CXCursor cursor)
	{
		auto canonicalCursor = clang_getCanonicalCursor(cursor);
		auto itCanonicalCursor = m_canonicalASTObjects.find(canonicalCursor);
		
		return (itCanonicalCursor == m_canonicalASTObjects.end()) ? NULL : itCanonicalCursor->second;
	}


	void Clang_AST::registerASTObject(CXCursor cursor, ASTObject* astObject)
	{
		assert(getASTObjectFromCursor(cursor) == NULL && "Cursor has already been registered");

		m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, astObject));
		m_canonicalASTObjects.insert(std::pair<CXCursor, ASTObject*>(clang_getCanonicalCursor(cursor), astObject));
	}

	void setStandardProperties(CXCursor cursor, ASTObject* astObject)
	{
		SelfDisposingCXString USR(clang_getCursorUSR(cursor));
		astObject->setUSR(USR.c_str());

		SelfDisposingCXString fullName(clang_getCursorDisplayName(cursor));
		astObject->setDisplayName(fullName.c_str());

		auto location = getSourceLocation(cursor);

		if(clang_isCursorDefinition(cursor))
			astObject->setDefinition(location);
		else if(clang_isDeclaration(cursor.kind))
			astObject->addDeclaration(location);
	}

	// returns the next namespace or astObject if it is itself a namespace
	ASTObject_Namespace* getParentNamespace(ASTObject* astObject)
	{
		//ASTObject_Namespace* ns = NULL;
		while(astObject->getKind() != KIND_NAMESPACE)
			astObject = astObject->getParent();

		return static_cast<ASTObject_Namespace*>(astObject);
	}

	ASTObject_Namespace* Clang_AST::addNamespace(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Namespace* astObject = new ASTObject_Namespace(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);
		
		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_Struct* Clang_AST::addStruct(CXCursor cursor, ASTObject* astParent, ASTObjectTemplateKind templateKind)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Struct* astObject = new ASTObject_Struct(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		templateInfo.setKind(templateKind);
		setTemplateInformation(templateInfo, cursor, astObject);
		
		registerASTObject(cursor, astObject);
		return astObject;
	}

	void Clang_AST::setTemplateInformation(ASTObjectHelper_Template& templateInfo, CXCursor cursor, ASTObject* astObject)
	{
		ASTObjectTemplateKind templateKind = templateInfo.getKind();
		if(templateKind == TEMPLATE_KIND_TEMPLATE || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			// setting parameters
			unsigned numParams = clang_getTemplateNumParameters(cursor);

			assert(numParams != UINT_MAX);

			for(unsigned i = 0; i < numParams; ++i)
			{
				CXCursor paramCursor = clang_getTemplateParameter(cursor, i);
				ASTObject_TemplateParameter* paramASTObject = static_cast<ASTObject_TemplateParameter*>(getASTObjectFromCursor(paramCursor));
				if(!paramASTObject)
				{
					SelfDisposingCXString nodeName(clang_getCursorSpelling(paramCursor));
					switch(paramCursor.kind)
					{
						case CXCursor_TemplateTypeParameter: paramASTObject = addTemplateTypeParameter(paramCursor, astObject);  break;
						case CXCursor_NonTypeTemplateParameter: paramASTObject = addTemplateNonTypeParameter(paramCursor, astObject);  break;
						case CXCursor_TemplateTemplateParameter: paramASTObject = addTemplateTemplateParameter(paramCursor, astObject);  break;
					}

				}
					
				assert(paramASTObject != NULL);

				templateInfo.addParameter(paramASTObject);
			}

		}

		if(templateKind == TEMPLATE_KIND_SPECIALIZATION || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			// setting arguments
			unsigned numArgs = clang_getTemplateSpecializationNumArguments(cursor);
			assert(numArgs != UINT_MAX);

			for(unsigned i = 0; i < numArgs; ++i)
			{
				CXCursor argCursor = clang_getTemplateSpecializationArgument(cursor, i);
				ASTObject_TemplateArgument* argASTObject = static_cast<ASTObject_TemplateArgument*>(getASTObjectFromCursor(argCursor));
				if(!argASTObject)
				{
					SelfDisposingCXString nodeName(clang_getCursorSpelling(argCursor));
					switch(argCursor.kind)
					{
						case CXCursor_TemplateTypeArgument: argASTObject = addTemplateTypeArgument(argCursor, astObject); break;
						case CXCursor_TemplateDeclarationArgument: argASTObject = addTemplateDeclarationArgument(argCursor, astObject); break;
						case CXCursor_TemplateIntegralArgument: argASTObject = addTemplateIntegralArgument(argCursor, astObject); break;
						case CXCursor_TemplateTemplateArgument: argASTObject = addTemplateTemplateArgument(argCursor, astObject); break;
						case CXCursor_TemplateExpressionArgument: argASTObject = addTemplateExpressionArgument(argCursor, astObject); break;
					}

				}
					
				assert(argASTObject != NULL);

				templateInfo.addArgument(argASTObject);
			}
		}
	}


	ASTObject_Class* Clang_AST::addClass(CXCursor cursor, ASTObject* astParent, ASTObjectTemplateKind templateKind)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Class* astObject = new ASTObject_Class(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		templateInfo.setKind(templateKind);
		setTemplateInformation(templateInfo, cursor, astObject);

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_TemplateTypeParameter* Clang_AST::addTemplateTypeParameter(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTypeParameter* astObject = new ASTObject_TemplateTypeParameter(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_TemplateNonTypeParameter* Clang_AST::addTemplateNonTypeParameter(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateNonTypeParameter* astObject = new ASTObject_TemplateNonTypeParameter(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_TemplateTemplateParameter* Clang_AST::addTemplateTemplateParameter(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTemplateParameter* astObject = new ASTObject_TemplateTemplateParameter(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_TemplateTypeArgument* Clang_AST::addTemplateTypeArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTypeArgument* astObject = new ASTObject_TemplateTypeArgument(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		ASTObject_Namespace* parentNS = getParentNamespace(astObject);

		astObject->setType(createASTType(clang_getTemplateArgumentValueAsType(cursor), false, parentNS));
		astObject->setTypeCanonical(createASTType(clang_getTemplateArgumentValueAsType(cursor), true, parentNS));

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_TemplateDeclarationArgument* Clang_AST::addTemplateDeclarationArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateDeclarationArgument* astObject = new ASTObject_TemplateDeclarationArgument(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		ASTObject* decl = getASTObjectFromCursor(clang_getTemplateArgumentValueAsDeclaration(cursor));
		assert(decl != NULL);

		astObject->setDeclaration(decl);

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_TemplateIntegralArgument* Clang_AST::addTemplateIntegralArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateIntegralArgument* astObject = new ASTObject_TemplateIntegralArgument(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		astObject->setIntegral(clang_getTemplateArgumentValueAsIntegral(cursor));

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_TemplateTemplateArgument* Clang_AST::addTemplateTemplateArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTemplateArgument* astObject = new ASTObject_TemplateTemplateArgument(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		ASTObject* decl = getASTObjectFromCursor(clang_getTemplateArgumentValueAsTemplate(cursor));
		assert(decl != NULL);

		astObject->setTemplate(decl);

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_TemplateExpressionArgument* Clang_AST::addTemplateExpressionArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateExpressionArgument* astObject = new ASTObject_TemplateExpressionArgument(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		registerASTObject(cursor, astObject);
		return astObject;
	}


	ASTObject_Field* Clang_AST::addField(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Field* astObject = new ASTObject_Field(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// Field properties
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);

		astObject->setAccess(static_cast<ASTObject_Struct*>(astParent)->getCurrentAccess());
		astObject->setType(createASTTypeFromCursor(cursor, false, parentNS));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true, parentNS));
		
		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_Function* Clang_AST::addFunction(CXCursor cursor, ASTObject* astParent, ASTObjectTemplateKind templateKind)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Function* astObject = new ASTObject_Function(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		templateInfo.setKind(templateKind);
		setTemplateInformation(templateInfo, cursor, astObject);

		// Function properties
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);
		CXType returnType = clang_getCursorResultType(cursor);
		astObject->setReturnType(createASTType(returnType, false, parentNS));
		astObject->setReturnTypeCanonical(createASTType(returnType, true, parentNS));

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_Member_Function* Clang_AST::addMemberFunction(CXCursor cursor, ASTObject* astParent, ASTObjectTemplateKind templateKind)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Member_Function* astObject = new ASTObject_Member_Function(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);	

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		templateInfo.setKind(templateKind);
		setTemplateInformation(templateInfo, cursor, astObject);

		// Member function properties
		CXType returnType = clang_getCursorResultType(cursor);

		// TODO: check if parent is struct or class
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);
		astObject->setAccess(static_cast<ASTObject_Struct*>(astParent)->getCurrentAccess());
		astObject->setReturnType(createASTType(returnType, false, parentNS));
		astObject->setReturnTypeCanonical(createASTType(returnType, true, parentNS));
		astObject->setVirtual(clang_CXXMethod_isVirtual(cursor) != 0);
		astObject->setStatic(clang_CXXMethod_isStatic(cursor) != 0);

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_Constructor* Clang_AST::addConstructor(CXCursor cursor, ASTObject* astParent, ASTObjectTemplateKind templateKind)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Constructor* astObject = new ASTObject_Constructor(nodeName.c_str());
		setStandardProperties(cursor, astObject);	

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		templateInfo.setKind(templateKind);
		setTemplateInformation(templateInfo, cursor, astObject);

		// Constructor properties
		// TODO: check if parent is struct or class, throw exception
		ASTObject_Struct* parentStruct = static_cast<ASTObject_Struct*>(astParent);
		astObject->setAccess(parentStruct->getCurrentAccess());
		parentStruct->addConstructor(astObject);
		
		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_Destructor* Clang_AST::addDestructor(CXCursor cursor, ASTObject* astParent, ASTObjectTemplateKind templateKind)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Destructor* astObject = new ASTObject_Destructor(nodeName.c_str());
		setStandardProperties(cursor, astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		templateInfo.setKind(templateKind);
		setTemplateInformation(templateInfo, cursor, astObject);
		
		// Destructor properties
		// TODO: check if parent is struct or class, throw exception
		ASTObject_Struct* parentStruct = static_cast<ASTObject_Struct*>(astParent);
		astObject->setAccess(parentStruct->getCurrentAccess());
		parentStruct->setDestructor(astObject);

		registerASTObject(cursor, astObject);
		return astObject;
	}

	// TODO: differ between declarations and definitions, otherwise multiple params
	ASTObject_Parameter* Clang_AST::addParameter(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Parameter* astObject = new ASTObject_Parameter(nodeName.c_str());
		setStandardProperties(cursor, astObject);

		// Parameter properties
		ASTObject_Namespace* parentNS = getParentNamespace(astParent);
		astObject->setType(createASTTypeFromCursor(cursor, false, parentNS));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true, parentNS));

		ASTObject_Function* parentFunc = dynamic_cast<ASTObject_Function*>(astParent);
		if(parentFunc)
			parentFunc->addParameter(astObject);

		// TODO: else throw exception

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_Variable_Decl* Clang_AST::addVariableDecl(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Variable_Decl* astObject = new ASTObject_Variable_Decl(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// Variable properties
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);
		astObject->setType(createASTTypeFromCursor(cursor, false, parentNS));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true, parentNS));

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_Typedef* Clang_AST::addTypedef(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Typedef* astObject = new ASTObject_Typedef(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);	

		// Typedef properties
		CXType type = clang_getTypedefDeclUnderlyingType(cursor);
		
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);
		astObject->setType(createASTType(type, false, parentNS));
		astObject->setTypeCanonical(createASTType(type, true, parentNS));

		// TODO: else throw exception

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_Enum* Clang_AST::addEnum(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Enum* astObject = new ASTObject_Enum(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);	

		registerASTObject(cursor, astObject);
		return astObject;
	}

	ASTObject_EnumConstant* Clang_AST::addEnumConstant(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_EnumConstant* astObject = new ASTObject_EnumConstant(nodeName.c_str());
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);	

		// EnumConstant properties
		astObject->setValue(clang_getEnumConstantDeclValue(cursor));

		registerASTObject(cursor, astObject);
		return astObject;
	}

	void Clang_AST::addBase(CXCursor cursor, ASTObject* astParent)
	{
		ASTObject* baseObject = getTypeDeclaration(cursor, true);
		// TODO: check if struct or class

		ASTObject_Struct* parentStruct = dynamic_cast<ASTObject_Struct*>(astParent);
		if(parentStruct)
		{
			

			enum CX_CXXAccessSpecifier access = clang_getCXXAccessSpecifier(cursor);

			ASTObjectAccess astAccess;

			switch (access) {
				case CX_CXXPublic:    astAccess = ACCESS_PUBLIC; break;
				case CX_CXXProtected: astAccess = ACCESS_PROTECTED; break;
				case CX_CXXPrivate:   astAccess = ACCESS_PRIVATE; break;
				default: break; // TODO: error
			}

			parentStruct->addBase(static_cast<ASTObject_Struct*>(baseObject), astAccess);
		}
		// TODO: else throw exception

	}

	ASTObject* Clang_AST::getTypeDeclaration(CXCursor cursor, bool canonical)
	{
		CXType inputType = clang_getCursorType(cursor);
		CXType type = (canonical) ? clang_getCanonicalType(inputType): inputType;

		CXCursor typeDecl = clang_getTypeDeclaration(type);
		auto it = m_astObjects.find(typeDecl);
		if(it != m_astObjects.end())
			return it->second;

		return NULL;
	}

	ASTType* Clang_AST::createASTTypeFromCursor(CXCursor cursor, bool canonical, ASTObject_Namespace* templateScope)
	{
		CXType type = clang_getCursorType(cursor);
		if(type.kind == CXType_Unexposed)
		{
			auto location = getSourceLocation(cursor);
			std::cout << location.line << ":" << location.column << ": WARNING: Found unexposed type" << std::endl;

			// TEMP: just for testing
			CXType type2 = clang_getCursorType(cursor);
		}
		return createASTType(type, canonical, templateScope);
	}

	ASTType* Clang_AST::createASTType(CXType inputType, bool canonical, ASTObject_Namespace* templateScope)
	{
		// TODO: fix canonical types for CXType_TemplateTypeParm and CXType_TemplateSpecialization
		bool isBuggyType = inputType.kind == CXType_TemplateTypeParm || inputType.kind == CXType_TemplateSpecialization;

		// do we use the canonical type or not?
		CXType type = (canonical && !isBuggyType) ? clang_getCanonicalType(inputType): inputType;

		SelfDisposingCXString kind(clang_getTypeKindSpelling(type.kind));

		ASTType* asttype = new ASTType();
		asttype->setKind(kind.c_str());
		switch(type.kind)
		{
			case CXType_Pointer:
			case CXType_LValueReference:
				{
					ASTType* pointsTo = createASTType(clang_getPointeeType(type), false, templateScope); 
					asttype->setPointsTo(pointsTo);
					break;
				}
			case CXType_Record:
			case CXType_Typedef:
				{
					CXCursor typeDecl = clang_getTypeDeclaration(type);
					auto astDecl = getASTObjectFromCursor(typeDecl);

					assert(astDecl != NULL);

					asttype->setDeclaration(astDecl);
					break;
				}
			case CXType_TemplateTypeParm:
			case CXType_TemplateSpecialization:
				{
					CXCursor typeDecl = clang_getTypeDeclaration(type);
					if(typeDecl.kind != CXCursor_NoDeclFound)
					{
						auto astDecl = getASTObjectFromCursor(typeDecl);

						if(!astDecl)
						{
							switch(typeDecl.kind)
							{
								case CXCursor_ClassDecl:
									astDecl = addClass(typeDecl, templateScope, TEMPLATE_KIND_SPECIALIZATION);
									break;
								case CXCursor_FunctionDecl:
									astDecl = addFunction(typeDecl, templateScope, TEMPLATE_KIND_SPECIALIZATION);
									break;
								case CXCursor_CXXMethod:
									astDecl = addMemberFunction(typeDecl, templateScope, TEMPLATE_KIND_SPECIALIZATION);
									break;
								case CXCursor_Constructor:
									astDecl = addConstructor(typeDecl, templateScope, TEMPLATE_KIND_SPECIALIZATION);
									break;
								case CXCursor_Destructor:
									astDecl = addDestructor(typeDecl, templateScope, TEMPLATE_KIND_SPECIALIZATION);
									break;
							}
						}

						//assert(astDecl != NULL);

						asttype->setDeclaration(astDecl);
					}
					break;
				}
		}

		asttype->setConst(clang_isConstQualifiedType(type) != 0);

		return asttype;
	}

	/** 
	 *
	 * \param 	cursor 
	 * \param 	parent 
	 * \param 	client_data 
	 * \return	
	 */
	CXChildVisitResult Clang_AST::visitCursor(CXCursor cursor, CXCursor parent, CXClientData client_data)
	{
		SelfDisposingCXString kindSpelling(clang_getCursorKindSpelling(cursor.kind));
		SelfDisposingCXString displayName(clang_getCursorDisplayName(cursor));
		SelfDisposingCXString cursorSpelling(clang_getCursorSpelling(cursor));
		SelfDisposingCXString usr(clang_getCursorUSR(cursor));

		std::string usr_string(usr.c_str());

		// check for multiple declarations
		auto kindSpellingC = std::string(kindSpelling.c_str());
		auto displayNameC = std::string(displayName.c_str());
		auto cursorSpellingC = std::string(cursorSpelling.c_str());

		
		// TODO: use clang_getCanonicalCursor
		//auto itUSR = m_usrASTObjects.find(usr_string);
		//if(itUSR != m_usrASTObjects.end())
		//{
		//	// use the same ASTObject*
		//	m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, itUSR->second));
		//	return CXChildVisit_Recurse;
		//}

		auto canonicalCursor = clang_getCanonicalCursor(cursor);
		auto itCanonicalCursor = m_canonicalASTObjects.find(canonicalCursor);
		if(itCanonicalCursor != m_canonicalASTObjects.end())
		{
			auto existingASTObject = itCanonicalCursor->second;

			// use the same ASTObject*
			m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, existingASTObject));

			auto location = getSourceLocation(cursor);

			if(clang_isCursorDefinition(cursor))
				existingASTObject->setDefinition(location);
			else
				existingASTObject->addDeclaration(location);


			return CXChildVisit_Recurse;
		}

		// get the parent ASTObject*
		ASTObject* astParent = NULL;
		CXCursorASTObjectMap::iterator it = m_astObjects.find(parent);
		if(it != m_astObjects.end())
			astParent = it->second;

		ASTObject* astObject = NULL;
		// differ between the cursors
		switch(cursor.kind)
		{
			case CXCursor_Namespace:
			{
				astObject = addNamespace(cursor, astParent);
				break;
			}

			case CXCursor_TypedefDecl:
			{
				astObject = addTypedef(cursor, astParent);
				break;
			}

			case CXCursor_StructDecl:
			{
				CXCursor templateCursor = clang_getSpecializedCursorTemplate(cursor);

				if(!clang_Cursor_isNull(templateCursor))
					astObject = addStruct(cursor, astParent, TEMPLATE_KIND_SPECIALIZATION);
				else
					astObject = addStruct(cursor, astParent, TEMPLATE_KIND_NON_TEMPLATE);

				break;
			}

			case CXCursor_ClassDecl:
			{
				CXCursor templateCursor = clang_getSpecializedCursorTemplate(cursor);

				if(!clang_Cursor_isNull(templateCursor))
					astObject = addClass(cursor, astParent, TEMPLATE_KIND_SPECIALIZATION);
				else
					astObject = addClass(cursor, astParent, TEMPLATE_KIND_NON_TEMPLATE);
				
				break;
			}

			case CXCursor_ClassTemplate:
			{
				// clang_getTemplateCursorKind
				// clang_getSpecializedCursorTemplate

				astObject = addClass(cursor, astParent, TEMPLATE_KIND_TEMPLATE);

				auto location = getSourceLocation(cursor);
				std::cout << location.line << ":" << location.column << ": CLASSTEMPLATE: " << kindSpelling.c_str() << " " << displayName.c_str() << "\n";

				break;
			}

			case CXCursor_ClassTemplatePartialSpecialization:
			{
				auto location = getSourceLocation(cursor);
				std::cout << location.line << ":" << location.column << ": CLASSTEMPLATEPARTIAL: " << kindSpelling.c_str() << " " << displayName.c_str() << "\n";

				astObject = addClass(cursor, astParent, TEMPLATE_KIND_PARTIAL_SPECIALIZATION);

				break;
			}

			case CXCursor_TemplateTypeParameter:
			{
				astObject = addTemplateTypeParameter(cursor, astParent);
				break;
			}

			case CXCursor_NonTypeTemplateParameter:
			{
				astObject = addTemplateNonTypeParameter(cursor, astParent);
				break;
			}

			case CXCursor_TemplateTemplateParameter:
			{
				astObject = addTemplateTemplateParameter(cursor, astParent);
				break;
			}

			case CXCursor_Constructor:
			{
				CXCursor templateCursor = clang_getSpecializedCursorTemplate(cursor);

				if(!clang_Cursor_isNull(templateCursor))
					astObject = addConstructor(cursor, astParent, TEMPLATE_KIND_SPECIALIZATION);
				else
					astObject = addConstructor(cursor, astParent, TEMPLATE_KIND_NON_TEMPLATE);

				break;
			}

			case CXCursor_Destructor:
			{
				CXCursor templateCursor = clang_getSpecializedCursorTemplate(cursor);

				if(!clang_Cursor_isNull(templateCursor))
					astObject = addDestructor(cursor, astParent, TEMPLATE_KIND_SPECIALIZATION);
				else
					astObject = addDestructor(cursor, astParent, TEMPLATE_KIND_NON_TEMPLATE);

				break;
			}

			case CXCursor_CXXBaseSpecifier:
			{
				addBase(cursor, astParent);
				break;
			}

			// changing the access
			case CXCursor_CXXAccessSpecifier:
			{
				std::cout << "ACCESS" << "\n";

				enum CX_CXXAccessSpecifier access = clang_getCXXAccessSpecifier(cursor);

				switch (access) {
					case CX_CXXPublic:    static_cast<ASTObject_Struct*>(astParent)->setCurrentAccess(ACCESS_PUBLIC); break;
					case CX_CXXProtected: static_cast<ASTObject_Struct*>(astParent)->setCurrentAccess(ACCESS_PROTECTED); break;
					case CX_CXXPrivate:   static_cast<ASTObject_Struct*>(astParent)->setCurrentAccess(ACCESS_PRIVATE); break;
					default: break; // TODO: error
				}      

				break;
			}
			
			case CXCursor_FunctionTemplate:
			{
				clang_getTemplateNumParameters(cursor);
				astObject = addFunction(cursor, astParent, TEMPLATE_KIND_TEMPLATE);
				break;
			}

			case CXCursor_CXXMethod:
			{
				CXCursor templateCursor = clang_getSpecializedCursorTemplate(cursor);

				if(!clang_Cursor_isNull(templateCursor))
					astObject = addMemberFunction(cursor, astParent, TEMPLATE_KIND_SPECIALIZATION);
				else
					astObject = addMemberFunction(cursor, astParent, TEMPLATE_KIND_NON_TEMPLATE);

				break;
			}

			case CXCursor_FunctionDecl:
				{
					CXCursor templateCursor = clang_getSpecializedCursorTemplate(cursor);

					if(!clang_Cursor_isNull(templateCursor))
						astObject = addFunction(cursor, astParent, TEMPLATE_KIND_SPECIALIZATION);
					else
						astObject = addFunction(cursor, astParent, TEMPLATE_KIND_NON_TEMPLATE);

					break;
				}

			case CXCursor_FieldDecl:
			{
				astObject = addField(cursor, astParent);
				break;
			}

			case CXCursor_VarDecl:
			{
				if(astParent && (astParent->getKind() == KIND_STRUCT || astParent->getKind() == KIND_CLASS))
				{
					astObject = addField(cursor, astParent);
					static_cast<ASTObject_Field*>(astObject)->setStatic(true);
				}
				else if(astParent && astParent->getKind() == KIND_NAMESPACE)
				{
					// TODO: global variables

					// TODO: function pointers
					
					astObject = addVariableDecl(cursor, astParent);
				}
				break;
			}
			
			// parameters
			case CXCursor_ParmDecl: 
			{
				// fix: parameters for multiple declarations
				// TODO: put somewhere else
				// TODO: 
				CXType funcType = clang_getCursorType(parent);
				unsigned numArgs = clang_getNumArgTypes(funcType);

				if(astParent && static_cast<ASTObject_Function*>(astParent)->getParameters().size() < numArgs)
					astObject = addParameter(cursor, astParent);
				break;
			}

			

			// ENUMS
			case CXCursor_EnumDecl:
			{
				astObject = addEnum(cursor, astParent);
				break;
			}

			case CXCursor_EnumConstantDecl:
			{
				astObject = addEnumConstant(cursor, astParent);
				break;
			}

			/*case CXCursor_TypeRef:
			{
				std::cout << "UNHANDLED: " << kindSpelling.c_str() << " " << displayName.c_str() << "\n";

				CXCursor refCursor = clang_getCursorReferenced(cursor);

				break;
			}*/
			
			default: 
				auto location = getSourceLocation(cursor);
				std::cout << location.line << ":" << location.column << ": UNHANDLED: " << kindSpelling.c_str() << " " << displayName.c_str() << "\n";
				break; // shouldn't happen

				// TODO templates
		}
		
		//if(astObject)
		//{
		//	m_astObjects.insert(std::pair<CXCursor, ASTObject*>(cursor, astObject));
		//	
		//	//if(usr_string != "")
		//	//	m_usrASTObjects.insert(std::pair<std::string, ASTObject*>(usr_string, astObject));

		//	//auto location = getSourceLocation(cursor);

		//	//if(clang_isCursorDefinition(cursor))
		//	//	astObject->setDefinition(location);
		//	//else
		//	//	astObject->addDeclaration(location);

		//	m_canonicalASTObjects.insert(std::pair<CXCursor, ASTObject*>(canonicalCursor, astObject));

		//	//std::cout << getASTObjectKind(astObject->getKind()).c_str() << " " << astObject->getNodeName().c_str() << "\n";
		//}
		
		return CXChildVisit_Recurse;
	}

	// just dirty for testing
	void Clang_AST::printTreeNode(ASTObject* node, int depth) const
	{
		std::string line;
		for(int i = 1; i <= depth; ++i)
			line += "  ";

		line += getASTObjectKind(node->getKind());
		line += ": ";
		line += to_string(node->getID());
		line += " ";
		line += ((node->getNodeName() != "" ) ? node->getNodeName() : "anonymous");

		std::cout << line << std::endl;
		auto& children = node->getChildren();

		auto end = children.end();
		for(auto it = children.begin(); it != end; ++it)
		{
			printTreeNode(*it, depth + 1);
		}
	}

	void Clang_AST::printTree() const
	{
		printTreeNode(m_rootASTObject, 0);
	}

}


