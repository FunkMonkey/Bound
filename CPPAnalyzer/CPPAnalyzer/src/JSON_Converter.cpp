#include "JSON_Converter.hpp"

#include "Clang_AST.hpp"

#include <json/json.h>
#include <assert.h>

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
	Json::Value& JSON_Converter::convertASTTypeToJSON(ASTType& type, Json::Value& objJSON)
	{
		//Json::Value objJSON;
		objJSON["kind"]    = type.getKind();
		objJSON["isConst"] = type.isConst();

		if((type.getKind() == "Record" || type.getKind() == "Typedef" || type.getKind() == "TemplateTypeParm" || type.getKind() == "TemplateSpecialization") && type.getDeclaration())
		{
			objJSON["declaration"] = type.getDeclaration()->getID();
			addASTObjectToReferencedList(*type.getDeclaration());
		}
		else if((type.getKind() == "Pointer" || type.getKind() == "LValueReference") && type.getPointsTo())
		{
			convertASTTypeToJSON(*type.getPointsTo(), objJSON["pointsTo"]);
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
				convertASTObjectToJSON(**it, templateParamsJSON.append(Json::Value(Json::objectValue)));
		}

		if(templateKind == TEMPLATE_KIND_SPECIALIZATION || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			objJSON["templateDeclaration"] = templateInfo.getTemplateDeclaration()->getID();

			auto& templateArgsJSON = objJSON["templateArguments"] = Json::Value(Json::arrayValue);
			for(auto it = templateInfo.getArguments().begin(), end = templateInfo.getArguments().end(); it!= end; ++it)
				convertASTObjectToJSON(**it, templateArgsJSON.append(Json::Value(Json::objectValue)));
		}

		// TODO: reference to template declaration
	}

	// TODO: performance
	Json::Value& JSON_Converter::convertASTObjectToJSON(ASTObject& astObject, Json::Value& objJSON,  int options_)
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

		addASTObjectToExportedList(astObject);
		
		//Json::Value objJSON;

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
					{
						// TODO: performance?
						convertASTObjectToJSON(**it, childrenJSON.append(Json::Value(Json::objectValue)));
					}

					break;
				}
			
			case KIND_TYPEDEF:
				{
					auto& astObjectTypedef = static_cast<ASTObject_Typedef&>(astObject);

					// type
					convertASTTypeToJSON(*astObjectTypedef.getType(),          objJSON["type"]);
					convertASTTypeToJSON(*astObjectTypedef.getTypeCanonical(), objJSON["typeCanonical"]);

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
						addASTObjectToReferencedList(*(*it).base);
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
								convertASTObjectToJSON(**it, childrenJSON.append(Json::Value(Json::objectValue)));
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
					convertASTTypeToJSON(*astObjectTemplArg.getType(),          objJSON["type"]);
					convertASTTypeToJSON(*astObjectTemplArg.getTypeCanonical(), objJSON["typeCanonical"] );
					break;
				}
			case KIND_TEMPLATE_DECLARATION_ARGUMENT:
				{
					auto& astObjectTemplArg = static_cast<ASTObject_TemplateDeclarationArgument&>(astObject);
					auto decl = astObjectTemplArg.getDeclaration();
					if(decl == NULL)
					{
						objJSON["declaration"] = -1;
						m_unknownMissingASTObjects = true;
					}
					else
					{
						objJSON["declaration"] = decl->getID();
						addASTObjectToReferencedList(*decl);
					}
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
					auto templ = astObjectTemplArg.getTemplate();
					if(templ == NULL)
					{
						objJSON["template"] = -1;
						m_unknownMissingASTObjects = true;
					}
					else
					{
						objJSON["template"] = templ->getID();
						addASTObjectToReferencedList(*templ);
					}
					break;
				}
			case KIND_VARIABLE_DECL:
				{
					auto& astObjectVar = static_cast<ASTObject_Variable_Decl&>(astObject);

					// props
					convertASTTypeToJSON(*astObjectVar.getType(), objJSON["type"]);
					convertASTTypeToJSON(*astObjectVar.getTypeCanonical(), objJSON["typeCanonical"]);

					break;
				}
			case KIND_FIELD:
				{
					auto& astObjectField = static_cast<ASTObject_Field&>(astObject);

					// props
					objJSON["access"]   = getASTObjectAccessString(astObjectField.getAccess());
					objJSON["isStatic"] = astObjectField.isStatic();
					convertASTTypeToJSON(*astObjectField.getType(),          objJSON["type"]);
					convertASTTypeToJSON(*astObjectField.getTypeCanonical(), objJSON["typeCanonical"]);

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
						convertASTTypeToJSON(*astObjectFunc.getReturnType(),          objJSON["returnType"]);
						convertASTTypeToJSON(*astObjectFunc.getReturnTypeCanonical(), objJSON["returnTypeCanonical"]);
					}

					// parameters
					if(kind != KIND_DESTRUCTOR)
					{
						auto& parametersJSON = objJSON["parameters"] = Json::Value(Json::arrayValue);
						auto& parameters = astObjectFunc.getParameters();
						for(auto it = parameters.begin(), end = parameters.end(); it != end; ++it)
						{
							convertASTObjectToJSON(**it, parametersJSON.append(Json::Value(Json::objectValue)));
						}
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
					convertASTTypeToJSON(*astObjectParam.getType(),          objJSON["type"]);
					convertASTTypeToJSON(*astObjectParam.getTypeCanonical(), objJSON["typeCanonical"]);

					break;
				}

			case KIND_ENUM:
				{
					// children
					auto& childrenJSON = objJSON["children"] = Json::Value(Json::arrayValue);
					auto& children = astObject.getChildren();

					for(auto it = children.begin(), end = children.end(); it!= end; ++it)
					{
						convertASTObjectToJSON(**it, childrenJSON.append(Json::Value(Json::objectValue)));
					}

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
		m_unknownMissingASTObjects = false;
		m_ASTObjects.clear();
		Json::Value root(Json::objectValue);
		convertASTObjectToJSON(*(m_ast->getRootASTObject()), root);

		if(m_unknownMissingASTObjects)
			std::cout << "ERROR: UNKNOWN MISSING OBJECTS" << std::endl;

		for(auto itM = m_ASTObjects.begin(), endM = m_ASTObjects.end(); itM != endM; ++itM)
		{
			if(itM->second == REFERENCED)
				std::cout << "ERROR MISSING: " << itM->first->getID() << std::endl;
			else if(itM->second == EXPORTED_AND_REFERENCED)
			{
				//std::cout << "INFO REFERENCED: " << itM->first->getID() << std::endl;
			}
		}

		Json::StyledWriter writer;
		str = writer.write( root );

		//std::cout << str << std::endl;
	}

	void JSON_Converter::addASTObjectToExportedList(ASTObject& astObject)
	{
		auto res = m_ASTObjects.find(&astObject);
		if(res != m_ASTObjects.end())
		{
			switch(res->second)
			{
				case EXPORTED:                break;
				case REFERENCED:              res->second = EXPORTED_AND_REFERENCED; break;
				case EXPORTED_AND_REFERENCED: break;
			}
		}
		else
		{
			m_ASTObjects.insert(std::pair<ASTObject*, ASTObjectStatus>(&astObject, EXPORTED));
		}
	}

	void JSON_Converter::addASTObjectToReferencedList(ASTObject& astObject)
	{
		auto res = m_ASTObjects.find(&astObject);
		if(res != m_ASTObjects.end())
		{
			switch(res->second)
			{
			case EXPORTED:                res->second = EXPORTED_AND_REFERENCED; break;
			case REFERENCED:              break;
			case EXPORTED_AND_REFERENCED: break;
			}
		}
		else
		{
			m_ASTObjects.insert(std::pair<ASTObject*, ASTObjectStatus>(&astObject, REFERENCED));
		}
	}

}