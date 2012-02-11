#include "JSON_Converter.hpp"

#include "Clang_AST.hpp"

#include <json/json.h>

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
#include "ASTObject_TemplateParameter.hpp"
#include "ASTObject_TemplateArgument.hpp"

#include "ASTType.hpp"

// TEMP
#include <iostream>

namespace CPPAnalyzer
{
	// TODO: performance
	Json::Value JSON_Converter::convertASTTypeToJSON(ASTType& type)
	{
		Json::Value objJSON;
		objJSON["kind"]    = type.getKind();
		objJSON["isConst"] = type.isConst();

		if((type.getKind() == "Record" || type.getKind() == "Typedef" || type.getKind() == "TemplateTypeParm" || type.getKind() == "TemplateSpecialization") && type.getDeclaration())
		{
			objJSON["declaration"] = type.getDeclaration()->getID();
		}
		else if((type.getKind() == "Pointer" || type.getKind() == "LValueReference") && type.getPointsTo())
		{
			objJSON["pointsTo"] = convertASTTypeToJSON(*type.getPointsTo());
		}

		return objJSON;
	}

	void JSON_Converter::addTemplateInfo(ASTObjectHelper_Template& templateInfo, Json::Value& objJSON, int options)
	{
		auto templateKind = templateInfo.getKind();
		objJSON["templateKind"] = getTemplateKindSpelling(templateKind);

		if(templateKind == TEMPLATE_KIND_TEMPLATE || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			auto& templateParamsJSON = objJSON["templateParameters"] = Json::Value(Json::arrayValue);
			for(auto it = templateInfo.getParameters().begin(), end = templateInfo.getParameters().end(); it!= end; ++it)
				templateParamsJSON.append(convertASTObjectToJSON(**it));
		}

		if(templateKind == TEMPLATE_KIND_SPECIALIZATION || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			auto& templateArgsJSON = objJSON["templateArguments"] = Json::Value(Json::arrayValue);
			for(auto it = templateInfo.getArguments().begin(), end = templateInfo.getArguments().end(); it!= end; ++it)
				templateArgsJSON.append(convertASTObjectToJSON(**it));
		}

		// TODO: reference to template declaration
	}

	// TODO: performance
	Json::Value JSON_Converter::convertASTObjectToJSON(ASTObject& astObject, int options_)
	{
		ASTObjectKind kind = astObject.getKind();

		int options = options_;
		switch(kind)
		{
			case KIND_NAMESPACE:        options = options & ~ADD_ISDEFINITION & ~ADD_DEFINITION & ~ADD_DECLARATIONS; break;
			case KIND_TYPEDEF:          break;
			case KIND_STRUCT:           break;
			case KIND_CLASS:            break;
			case KIND_VARIABLE_DECL:    break;
			case KIND_FIELD:            break;
			case KIND_FUNCTION:         break;
			case KIND_MEMBER_FUNCTION:  break;
			case KIND_PARAMETER:        options = options & ~ADD_ISDEFINITION & ~ADD_DEFINITION & ~ADD_DECLARATIONS; break;
			case KIND_CONSTRUCTOR:      break;
			case KIND_DESTRUCTOR:       break;
			case KIND_ENUM:             break;
			case KIND_ENUMCONSTANT:     break;
			case KIND_UNION:            break;
			case KIND_TEMPLATE_TYPE_PARAMETER:			    
			case KIND_TEMPLATE_NON_TYPE_PARAMETER:		    
			case KIND_TEMPLATE_TEMPLATE_PARAMETER:		    options = options & ~ADD_ISDEFINITION & ~ADD_DEFINITION & ~ADD_DECLARATIONS & ~ADD_DISPLAYNAME & ~ADD_USR; break;
			case KIND_TEMPLATE_NULL_ARGUMENT:			    
			case KIND_TEMPLATE_TYPE_ARGUMENT:               
			case KIND_TEMPLATE_DECLARATION_ARGUMENT:        
			case KIND_TEMPLATE_INTEGRAL_ARGUMENT:           
			case KIND_TEMPLATE_TEMPLATE_ARGUMENT:           
			case KIND_TEMPLATE_TEMPLATE_EXPANSION_ARGUMENT: 
			case KIND_TEMPLATE_EXPRESSION_ARGUMENT:         
			case KIND_TEMPLATE_PACK_ARGUMENT:               options = options & ~ADD_ISDEFINITION & ~ADD_DEFINITION & ~ADD_DECLARATIONS & ~ADD_ID &~ADD_NAME & ~ADD_DISPLAYNAME & ~ADD_USR; break;
		}
		
		Json::Value objJSON;

		if(options & ADD_NAME)
			objJSON["name"] = astObject.getNodeName();

		if(options & ADD_DISPLAYNAME)
			objJSON["displayname"] = astObject.getDisplayName();

		if(options & ADD_USR)
			objJSON["USR"]  = astObject.getUSR();

		if(options & ADD_ID)
			objJSON["id"]           = astObject.getID();

		if(options & ADD_KIND)
			objJSON["kind"]         = getASTObjectKind(astObject.getKind());

		if(options & ADD_ISDEFINITION)
		objJSON["isDefinition"] = astObject.isDefinition();

		if(options & ADD_DEFINITION)
		{
			auto& definitionJSON = objJSON["definition"] = Json::Value(Json::objectValue);
			definitionJSON["fileName"] = astObject.getDefinitionSource().fileName;
		}
		
		if(options & ADD_DECLARATIONS)
		{
			auto& declarationsJSON = objJSON["declarations"] = Json::Value(Json::arrayValue);
			auto& declarations = astObject.getDeclarationsSource();
			for(auto it = declarations.begin(), end = declarations.end(); it != end; ++it)
			{
				auto& declJSON = declarationsJSON.append(Json::objectValue);
				declJSON["fileName"] = (*it).fileName;
			}
		}
		
		switch(kind)
		{
			case KIND_NAMESPACE:
				{
					// adding children
					auto& childrenJSON = objJSON["children"] = Json::Value(Json::arrayValue);
					auto& children = astObject.getChildren();

					for(auto it = children.begin(), end = children.end(); it!= end; ++it)
						childrenJSON.append(convertASTObjectToJSON(**it));

					break;
				}
			
			case KIND_TYPEDEF:
				{
					auto& astObjectTypedef = static_cast<ASTObject_Typedef&>(astObject);

					// type
					objJSON["type"]          = convertASTTypeToJSON(*astObjectTypedef.getType());
					objJSON["typeCanonical"] = convertASTTypeToJSON(*astObjectTypedef.getTypeCanonical());

					break;
				}
			case KIND_STRUCT:
			case KIND_CLASS:
				{
					auto& astObjectStruct = static_cast<ASTObject_Struct&>(astObject);

					// adding bases
					auto& basesJSON = objJSON["bases"] = Json::Value(Json::arrayValue);
					auto& bases = astObjectStruct.getBases();
					for(auto it = bases.begin(), end = bases.end(); it != end; ++it)
					{
						auto& baseJSON = basesJSON.append(Json::objectValue);
						baseJSON["id"]     = (*it).base->getID();
						baseJSON["access"] = getASTObjectAccessString((*it).access);
					}

					// adding children
					auto& childrenJSON = objJSON["children"] = Json::Value(Json::arrayValue);
					auto& children = astObject.getChildren();

					for(auto it = children.begin(), end = children.end(); it!= end; ++it)
					{
						switch((*it)->getKind())
						{
							case KIND_NAMESPACE:
							case KIND_TYPEDEF:
							case KIND_STRUCT:
							case KIND_CLASS:
							case KIND_VARIABLE_DECL:
							case KIND_FIELD:
							case KIND_FUNCTION:
							case KIND_MEMBER_FUNCTION:
							case KIND_PARAMETER:
							case KIND_CONSTRUCTOR:
							case KIND_DESTRUCTOR:
							case KIND_ENUM:
							case KIND_ENUMCONSTANT:
							case KIND_UNION:
								childrenJSON.append(convertASTObjectToJSON(**it));
								break;
							default:
								break;
						}
					}

					// template info
					auto& templateInfo = astObjectStruct.getTemplateInfo();
					addTemplateInfo(templateInfo, objJSON, options);

					break;
				}

			case KIND_TEMPLATE_TYPE_ARGUMENT:
				{
					auto& astObjectTemplArg = static_cast<ASTObject_TemplateTypeArgument&>(astObject);
					objJSON["type"] = convertASTTypeToJSON(*astObjectTemplArg.getType());
					objJSON["typeCanonical"] = convertASTTypeToJSON(*astObjectTemplArg.getTypeCanonical());
					break;
				}
			case KIND_TEMPLATE_DECLARATION_ARGUMENT:
				{
					auto& astObjectTemplArg = static_cast<ASTObject_TemplateDeclarationArgument&>(astObject);
					objJSON["declaration"] = (astObjectTemplArg.getDeclaration() == NULL) ? -1 : astObjectTemplArg.getDeclaration()->getID();
					break;
				}
			case KIND_TEMPLATE_INTEGRAL_ARGUMENT:
				{
					auto& astObjectTemplArg = static_cast<ASTObject_TemplateIntegralArgument&>(astObject);
					objJSON["integral"] = astObjectTemplArg.getIntegral();
					break;
				}
			case KIND_TEMPLATE_TEMPLATE_ARGUMENT:
				{
					auto& astObjectTemplArg = static_cast<ASTObject_TemplateTemplateArgument&>(astObject);
					objJSON["declaration"] = (astObjectTemplArg.getTemplate() == NULL) ? -1 : astObjectTemplArg.getTemplate()->getID();
					break;
				}
			case KIND_VARIABLE_DECL:
				{
					auto& astObjectVar = static_cast<ASTObject_Variable_Decl&>(astObject);

					// props
					objJSON["type"]          = convertASTTypeToJSON(*astObjectVar.getType());
					objJSON["typeCanonical"] = convertASTTypeToJSON(*astObjectVar.getTypeCanonical());

					break;
				}
			case KIND_FIELD:
				{
					auto& astObjectField = static_cast<ASTObject_Field&>(astObject);

					// props
					objJSON["access"]   = getASTObjectAccessString(astObjectField.getAccess());
					objJSON["isStatic"] = astObjectField.isStatic();
					objJSON["type"]          = convertASTTypeToJSON(*astObjectField.getType());
					objJSON["typeCanonical"] = convertASTTypeToJSON(*astObjectField.getTypeCanonical());

					break;
				}
			case KIND_FUNCTION:
			case KIND_MEMBER_FUNCTION:
			case KIND_CONSTRUCTOR:
			case KIND_DESTRUCTOR:
				{
					auto& astObjectFunc = static_cast<ASTObject_Function&>(astObject);

					// moak ... don't like that very much
					auto astObjectMemberFunc = dynamic_cast<ASTObject_Member_Function*>(&astObject);
					if(astObjectMemberFunc)
					{
						objJSON["access"]   = getASTObjectAccessString(astObjectMemberFunc->getAccess());

						// only non-constructor, non-destructor member functions
						if(kind == KIND_MEMBER_FUNCTION)
						{
							objJSON["isStatic"] = astObjectMemberFunc->isStatic();
							objJSON["isConst"]  = astObjectMemberFunc->isConst();
						}

						if(kind != KIND_CONSTRUCTOR)
							objJSON["isVirtual"]  = astObjectMemberFunc->isVirtual();
					}
					
					// return type
					if(kind == KIND_FUNCTION || kind == KIND_MEMBER_FUNCTION)
					{
						objJSON["returnType"]          = convertASTTypeToJSON(*astObjectFunc.getReturnType());
						objJSON["returnTypeCanonical"] = convertASTTypeToJSON(*astObjectFunc.getReturnTypeCanonical());
					}

					// parameters
					if(kind != KIND_DESTRUCTOR)
					{
						auto& parametersJSON = objJSON["parameters"] = Json::Value(Json::arrayValue);
						auto& parameters = astObjectFunc.getParameters();
						for(auto it = parameters.begin(), end = parameters.end(); it != end; ++it)
							parametersJSON.append(convertASTObjectToJSON(**it));
					}

					// template info
					auto& templateInfo = astObjectFunc.getTemplateInfo();
					addTemplateInfo(templateInfo, objJSON, options);

					break;
				}
			case KIND_PARAMETER:
				{
					auto& astObjectParam = static_cast<ASTObject_Parameter&>(astObject);

					//paramJSON["name"]          = (*it)->getNodeName();
					objJSON["type"]          = convertASTTypeToJSON(*astObjectParam.getType());
					objJSON["typeCanonical"] = convertASTTypeToJSON(*astObjectParam.getTypeCanonical());

					break;
				}

			case KIND_ENUM:
				{
					// children
					auto& childrenJSON = objJSON["children"] = Json::Value(Json::arrayValue);
					auto& children = astObject.getChildren();

					for(auto it = children.begin(), end = children.end(); it!= end; ++it)
						childrenJSON.append(convertASTObjectToJSON(**it));

					break;
				}
			case KIND_ENUMCONSTANT:
				{
					auto& astObjectEnumConstant = static_cast<ASTObject_EnumConstant&>(astObject);
					
					objJSON["value"] = astObjectEnumConstant.getValue();
				}
		}

		return objJSON;
	}

	void JSON_Converter::convertToJSON(std::string& str)
	{
		Json::Value root = convertASTObjectToJSON(*(m_ast->getRootASTObject()));

		Json::StyledWriter writer;
		str = writer.write( root );

		//std::cout << str << std::endl;
	}

}