
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
#include "ASTObject_Union.hpp"

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
		registerASTObject(m_rootCursor, m_rootASTObject);
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
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);
		
		return astObject;
	}

	ASTObject_Union* Clang_AST::addUnion(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Union* astObject = new ASTObject_Union(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		return astObject;
	}

	ASTObject_Struct* Clang_AST::addStruct(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Struct* astObject = new ASTObject_Struct(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);
		
		return astObject;
	}

	void Clang_AST::setTemplateInformation(ASTObjectHelper_Template& templateInfo, CXCursor cursor, ASTObject* astObject)
	{
		ASTObjectTemplateKind templateKind = TEMPLATE_KIND_NON_TEMPLATE;
		CXCursor templateCursor;

		switch(cursor.kind)
		{
			case CXCursor_StructDecl:
			case CXCursor_ClassDecl:
		
			case CXCursor_FunctionDecl:
			case CXCursor_CXXMethod:
			case CXCursor_Constructor:
			case CXCursor_Destructor: 
				{
					templateCursor = clang_getSpecializedCursorTemplate(cursor);
					if(clang_Cursor_isNull(templateCursor))
						templateKind = TEMPLATE_KIND_NON_TEMPLATE;
					else
						templateKind = TEMPLATE_KIND_SPECIALIZATION;
					break;
				}

			case CXCursor_ClassTemplate:
			case CXCursor_FunctionTemplate: templateKind = TEMPLATE_KIND_TEMPLATE; break;

			case CXCursor_ClassTemplatePartialSpecialization: 
				{
					templateCursor = clang_getSpecializedCursorTemplate(cursor);
					assert(!clang_Cursor_isNull(templateCursor));
					templateKind = TEMPLATE_KIND_PARTIAL_SPECIALIZATION; 
					break;
				}
		}

		templateInfo.setKind(templateKind);

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
			// setting template
			ASTObject* templDecl = getASTObjectFromCursor(templateCursor);
			assert(templDecl != nullptr);

			templateInfo.setTemplateDeclaration(templDecl);

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


	ASTObject_Class* Clang_AST::addClass(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Class* astObject = new ASTObject_Class(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);

		return astObject;
	}

	ASTObject_TemplateTypeParameter* Clang_AST::addTemplateTypeParameter(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTypeParameter* astObject = new ASTObject_TemplateTypeParameter(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		return astObject;
	}

	ASTObject_TemplateNonTypeParameter* Clang_AST::addTemplateNonTypeParameter(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateNonTypeParameter* astObject = new ASTObject_TemplateNonTypeParameter(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		return astObject;
	}

	ASTObject_TemplateTemplateParameter* Clang_AST::addTemplateTemplateParameter(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTemplateParameter* astObject = new ASTObject_TemplateTemplateParameter(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		return astObject;
	}

	ASTObject_TemplateTypeArgument* Clang_AST::addTemplateTypeArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTypeArgument* astObject = new ASTObject_TemplateTypeArgument(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		ASTObject_Namespace* parentNS = getParentNamespace(astObject);

		astObject->setType(createASTType(clang_getTemplateArgumentValueAsType(cursor), false, parentNS));
		astObject->setTypeCanonical(createASTType(clang_getTemplateArgumentValueAsType(cursor), true, parentNS));

		return astObject;
	}

	ASTObject_TemplateDeclarationArgument* Clang_AST::addTemplateDeclarationArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateDeclarationArgument* astObject = new ASTObject_TemplateDeclarationArgument(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		ASTObject* decl = getASTObjectFromCursor(clang_getTemplateArgumentValueAsDeclaration(cursor));
		assert(decl != NULL);

		astObject->setDeclaration(decl);

		return astObject;
	}

	ASTObject_TemplateIntegralArgument* Clang_AST::addTemplateIntegralArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateIntegralArgument* astObject = new ASTObject_TemplateIntegralArgument(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		astObject->setIntegral(clang_getTemplateArgumentValueAsIntegral(cursor));

		return astObject;
	}

	ASTObject_TemplateTemplateArgument* Clang_AST::addTemplateTemplateArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateTemplateArgument* astObject = new ASTObject_TemplateTemplateArgument(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		ASTObject* decl = getASTObjectFromCursor(clang_getTemplateArgumentValueAsTemplate(cursor));
		assert(decl != NULL);

		astObject->setTemplate(decl);

		return astObject;
	}

	ASTObject_TemplateExpressionArgument* Clang_AST::addTemplateExpressionArgument(CXCursor cursor, ASTObject* astParent)
	{
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_TemplateExpressionArgument* astObject = new ASTObject_TemplateExpressionArgument(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		return astObject;
	}


	ASTObject_Field* Clang_AST::addField(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Field* astObject = new ASTObject_Field(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// Field properties
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);

		astObject->setAccess(static_cast<ASTObject_Struct*>(astParent)->getCurrentAccess());
		astObject->setType(createASTTypeFromCursor(cursor, false, parentNS));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true, parentNS));
		
		return astObject;
	}

	ASTObject_Function* Clang_AST::addFunction(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Function* astObject = new ASTObject_Function(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);

		// Function properties
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);
		CXType returnType = clang_getCursorResultType(cursor);
		astObject->setReturnType(createASTType(returnType, false, parentNS));
		astObject->setReturnTypeCanonical(createASTType(returnType, true, parentNS));

		return astObject;
	}

	ASTObject_Member_Function* Clang_AST::addMemberFunction(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Member_Function* astObject = new ASTObject_Member_Function(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);	

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
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

		return astObject;
	}

	ASTObject_Constructor* Clang_AST::addConstructor(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Constructor* astObject = new ASTObject_Constructor(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);	

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);

		// Constructor properties
		// TODO: check if parent is struct or class, throw exception
		ASTObject_Struct* parentStruct = static_cast<ASTObject_Struct*>(astParent);
		astObject->setAccess(parentStruct->getCurrentAccess());
		parentStruct->addConstructor(astObject);
		
		return astObject;
	}

	ASTObject_Destructor* Clang_AST::addDestructor(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Destructor* astObject = new ASTObject_Destructor(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);

		// template properties
		auto& templateInfo = astObject->getTemplateInfo();
		setTemplateInformation(templateInfo, cursor, astObject);
		
		// Destructor properties
		// TODO: check if parent is struct or class, throw exception
		ASTObject_Struct* parentStruct = static_cast<ASTObject_Struct*>(astParent);
		astObject->setAccess(parentStruct->getCurrentAccess());
		parentStruct->setDestructor(astObject);

		return astObject;
	}

	// TODO: differ between declarations and definitions, otherwise multiple params
	ASTObject_Parameter* Clang_AST::addParameter(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Parameter* astObject = new ASTObject_Parameter(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);

		// Parameter properties
		ASTObject_Namespace* parentNS = getParentNamespace(astParent);
		astObject->setType(createASTTypeFromCursor(cursor, false, parentNS));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true, parentNS));

		ASTObject_Function* parentFunc = dynamic_cast<ASTObject_Function*>(astParent);
		if(parentFunc)
			parentFunc->addParameter(astObject);

		// TODO: else throw exception

		return astObject;
	}

	ASTObject_Variable_Decl* Clang_AST::addVariableDecl(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Variable_Decl* astObject = new ASTObject_Variable_Decl(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);

		// Variable properties
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);
		astObject->setType(createASTTypeFromCursor(cursor, false, parentNS));
		astObject->setTypeCanonical(createASTTypeFromCursor(cursor, true, parentNS));

		return astObject;
	}

	ASTObject_Typedef* Clang_AST::addTypedef(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Typedef* astObject = new ASTObject_Typedef(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);	

		// Typedef properties
		CXType type = clang_getTypedefDeclUnderlyingType(cursor);
		
		ASTObject_Namespace* parentNS = getParentNamespace(astObject);
		astObject->setType(createASTType(type, false, parentNS));
		astObject->setTypeCanonical(createASTType(type, true, parentNS));

		// TODO: else throw exception

		return astObject;
	}

	ASTObject_Enum* Clang_AST::addEnum(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_Enum* astObject = new ASTObject_Enum(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);	

		return astObject;
	}

	ASTObject_EnumConstant* Clang_AST::addEnumConstant(CXCursor cursor, ASTObject* astParent)
	{
		// Common properties
		SelfDisposingCXString nodeName(clang_getCursorSpelling(cursor));

		ASTObject_EnumConstant* astObject = new ASTObject_EnumConstant(nodeName.c_str());
		registerASTObject(cursor, astObject);
		setStandardProperties(cursor, astObject);
		astParent->addChild(astObject);	

		// EnumConstant properties
		astObject->setValue(clang_getEnumConstantDeclValue(cursor));

		return astObject;
	}

	void Clang_AST::addBase(CXCursor cursor, ASTObject* astParent)
	{
		CXType baseType = clang_getCursorType(cursor);
		CXCursor baseDecl = clang_getTypeDeclaration(baseType);

		ASTObject* baseObject = getASTObjectFromCursor(baseDecl);
		if(!baseObject)
		{
			ASTObject_Namespace* parentNS = getParentNamespace(astParent);

			switch(baseDecl.kind)
			{
			case CXCursor_StructDecl:
				baseObject = addStruct(baseDecl, parentNS);
				break;
			case CXCursor_ClassDecl:
				baseObject = addClass(baseDecl, parentNS);
				break;
			case CXCursor_FunctionDecl:
				baseObject = addFunction(baseDecl, parentNS);
				break;
			case CXCursor_CXXMethod:
				baseObject = addMemberFunction(baseDecl, parentNS);
				break;
			case CXCursor_Constructor:
				baseObject = addConstructor(baseDecl, parentNS);
				break;
			case CXCursor_Destructor:
				baseObject = addDestructor(baseDecl, parentNS);
				break;
			}
		}

		assert(baseObject != NULL);
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

	/*ASTObject* Clang_AST::getTypeDeclaration(CXCursor cursor, bool canonical)
	{
		CXType inputType = clang_getCursorType(cursor);
		CXType type = (canonical) ? clang_getCanonicalType(inputType): inputType;

		CXCursor typeDecl = clang_getTypeDeclaration(type);
		auto it = m_astObjects.find(typeDecl);
		if(it != m_astObjects.end())
			return it->second;

		return NULL;
	}*/

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

	void printCursorInfo(CXCursor cursor, const std::string& prefix = "", bool fileInfo = true)
	{
		auto pKindSpellingC = std::string(SelfDisposingCXString(clang_getCursorKindSpelling(cursor.kind)).c_str());
		auto pDisplayNameC = std::string(SelfDisposingCXString(clang_getCursorDisplayName(cursor)).c_str());

		std::cout << prefix.c_str() << pKindSpellingC.c_str() << ": " << pDisplayNameC.c_str() << " ";

		if(fileInfo)
		{
			auto location = getSourceLocation(cursor);
			std::cout << "\n\t\t in " << location.fileName << ":" << location.line << ":" << location.column;
		}
			
		std::cout << "\n";
	}

	bool isBuggyType(CXType type)
	{
		while(true)
		{
			switch(type.kind)
			{
				case CXType_TemplateTypeParm:
				case CXType_TemplateSpecialization:
					return true;
				case CXType_Pointer:
				case CXType_LValueReference:
					type = clang_getPointeeType(type);
					break;

				default:
					return false;
			}
		}
	}

	ASTType* Clang_AST::createASTType(CXType type, bool canonical, ASTObject_Namespace* templateScope)
	{
		// TODO: fix canonical types for CXType_TemplateTypeParm and CXType_TemplateSpecialization
		//bool isBuggyType = isBuggyType(inputType); //inputType.kind == CXType_TemplateTypeParm || inputType.kind == CXType_TemplateSpecialization;

		// do we use the canonical type or not?
		bool messedWithType = false;

		if(canonical && !isBuggyType(type))
		{
			type = clang_getCanonicalType(type);
			messedWithType = true;
		}

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
				/*{
				CXCursor typeDecl = clang_getTypeDeclaration(type);
				auto astDecl = getASTObjectFromCursor(typeDecl);

				if(!astDecl)
				{
				printCursorInfo(typeDecl, "ERROR: ASTObject for Cursor not existing: ");
				assert(astDecl != NULL);
				}

				asttype->setDeclaration(astDecl);
				break;
				}*/
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
								case CXCursor_StructDecl:
									astDecl = addStruct(typeDecl, templateScope);
									break;
								case CXCursor_ClassDecl:
									astDecl = addClass(typeDecl, templateScope);
									break;
								case CXCursor_FunctionDecl:
									astDecl = addFunction(typeDecl, templateScope);
									break;
								case CXCursor_CXXMethod:
									astDecl = addMemberFunction(typeDecl, templateScope);
									break;
								case CXCursor_Constructor:
									astDecl = addConstructor(typeDecl, templateScope);
									break;
								case CXCursor_Destructor:
									astDecl = addDestructor(typeDecl, templateScope);
									break;
							}
						}

						if(!astDecl)
						{
							printCursorInfo(typeDecl, "ERROR: ASTObject for Cursor not existing: ");
							assert(astDecl != NULL);
						}

						asttype->setDeclaration(astDecl);
					}
					// TODO: check if we need an assert here: 
					else
					{
						// TODO: put into error-reporter
						printCursorInfo(typeDecl, "ERROR-INFO: No type declaration existing ");
						//CXCursor typeDecl2 = clang_getTypeDeclaration(type);
						//assert(false);
					}
					break;
				}
		}

		asttype->setConst(clang_isConstQualifiedType(type) != 0);

		return asttype;
	}


	CXCursor Clang_AST::getParentCursor(CXCursor cursor)
	{
		auto it = m_parentMap.find(cursor);
		if(it != m_parentMap.end())
		{
			return it->second;
		}

		CXCursor C = { CXCursor_NoDeclFound, 0, { 0, 0, cursor.data[2]}};
		return C;
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
		// save in parent map
		m_parentMap.insert(std::pair<CXCursor, CXCursor>(cursor, parent));

		SelfDisposingCXString kindSpelling(clang_getCursorKindSpelling(cursor.kind));
		SelfDisposingCXString displayName(clang_getCursorDisplayName(cursor));
		SelfDisposingCXString cursorSpelling(clang_getCursorSpelling(cursor));
		SelfDisposingCXString usr(clang_getCursorUSR(cursor));

		std::string usr_string(usr.c_str());

		// check for multiple declarations
		auto kindSpellingC = std::string(kindSpelling.c_str());
		auto displayNameC = std::string(displayName.c_str());
		auto cursorSpellingC = std::string(cursorSpelling.c_str());

		
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

		if(!astParent)
		{
			// try parents parent
			//if(parent.kind == CXCursor_LinkageSpec)
			{
				CXCursor currParent = parent;
				while(!astParent && currParent.kind != CXCursor_NoDeclFound)
				{
					currParent = getParentCursor(currParent);
					astParent = getASTObjectFromCursor(currParent);
				}
			}
			
			if(!astParent)
			{
				auto pKindSpellingC = std::string(SelfDisposingCXString(clang_getCursorKindSpelling(parent.kind)).c_str());
				auto pDisplayNameC = std::string(SelfDisposingCXString(clang_getCursorDisplayName(parent)).c_str());
				auto pCursorSpellingC = std::string(SelfDisposingCXString(clang_getCursorSpelling(parent)).c_str());

				auto location = getSourceLocation(cursor);
				std::cout << location.fileName << ":" << location.line << ":" << location.column << ": NO PARENT: " << kindSpelling.c_str() << " " << displayName.c_str() << pKindSpellingC.c_str() << ": " << pDisplayNameC.c_str() << "; parent is supposed to be " <<  "\n";
				assert(astParent != nullptr);
			}


			
		}

		ASTObject* astObject = NULL;
		// differ between the cursors
		switch(cursor.kind)
		{
			case CXCursor_Namespace:
			{
				astObject = addNamespace(cursor, astParent);
				break;
			}

			case CXCursor_UnionDecl:
			{
				astObject = addUnion(cursor, astParent);
				break;
			}

			case CXCursor_TypedefDecl:
			{
				astObject = addTypedef(cursor, astParent);
				break;
			}

			case CXCursor_StructDecl:
			{
				astObject = addStruct(cursor, astParent);
				break;
			}

			case CXCursor_ClassDecl:
			{
				astObject = addClass(cursor, astParent);
				break;
			}

			case CXCursor_ClassTemplate:
			{
				astObject = addClass(cursor, astParent);
				break;
			}

			case CXCursor_ClassTemplatePartialSpecialization:
			{
				astObject = addClass(cursor, astParent);
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
				astObject = addConstructor(cursor, astParent);
				break;
			}

			case CXCursor_Destructor:
			{
				astObject = addDestructor(cursor, astParent);
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
				astObject = addFunction(cursor, astParent);
				break;
			}

			case CXCursor_CXXMethod:
			{
				astObject = addMemberFunction(cursor, astParent);
				break;
			}

			case CXCursor_FunctionDecl:
				{
					astObject = addFunction(cursor, astParent);
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

			case CXCursor_LinkageSpec:
			{
				break;
			}

			case CXCursor_TemplateRef:
			case CXCursor_TypeRef:
			case CXCursor_CompoundStmt:
			case CXCursor_IntegerLiteral:
			case CXCursor_UsingDeclaration:
			case CXCursor_NamespaceRef:
			case CXCursor_CStyleCastExpr:
			case CXCursor_DeclRefExpr:
			case CXCursor_UnexposedAttr:
			case CXCursor_CXXBoolLiteralExpr:
			case CXCursor_ParenExpr:
			case CXCursor_CallExpr:
			case CXCursor_MemberRef:
			case CXCursor_UnaryOperator:
			case CXCursor_BinaryOperator:
			case CXCursor_UnexposedExpr:
			case CXCursor_ConditionalOperator:
				return CXChildVisit_Continue;
			
			default: 
				auto location = getSourceLocation(cursor);
				std::cout << location.fileName << ":" << location.line << ":" << location.column << ": UNHANDLED: " << kindSpelling.c_str() << " " << displayName.c_str() << "\n";

				return CXChildVisit_Continue;
				break;

				// TODO templates
		}
		
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


