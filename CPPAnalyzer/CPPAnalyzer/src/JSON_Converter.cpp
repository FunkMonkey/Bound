#include "JSON_Converter.hpp"

#include "Clang_AST.hpp"
#include "Clang_AST_CXTree.hpp"

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
	Json::Value& JSON_Converter::convertASTTypeToJSON(ASTType& type, Json::Value& objJSON)
	{
		// common information
		objJSON["kind"]    = type.getKind();
		objJSON["isConst"] = type.isConst();
		objJSON["id"] = type.getID();

		// information about declaration
		if((type.getKind() == "Record" || type.getKind() == "Typedef" || type.getKind() == "Elaborated" || type.getKind() == "TemplateTypeParm" || type.getKind() == "TemplateSpecialization") && type.getDeclaration())
		{
			objJSON["declaration"] = type.getDeclaration()->getID();
			addASTObjectToReferencedList(*type.getDeclaration());
		}
		// information about pointees
		else if((type.getKind() == "Pointer" || type.getKind() == "LValueReference") && type.getPointsTo())
		{
			objJSON["pointsTo"] = type.getPointsTo()->getID();
		}
		// function type information
		else if(type.getKind() == "FunctionProto")
		{
			auto& parameters = type.getParameters();
			if(parameters.size() > 0)
			{
				auto& paramsJSON = objJSON["parameters"] = Json::Value(Json::arrayValue);
				for(auto it = parameters.begin(), end = parameters.end(); it != end; ++it)
					paramsJSON.append((*it)->getID());
			}
		}

		// add the canonical type
		if(!type.isCanonical())
			objJSON["canonicalType"] = type.getCanonicalType()->getID();

		return objJSON;
	}

	void JSON_Converter::addTemplateInfo(ASTObjectHelper_Template& templateInfo, Json::Value& objJSON, int options)
	{
		// common information
		auto templateKind = templateInfo.getKind();
		objJSON["templateKind"] = getTemplateKindSpelling(templateKind);

		// template parameters
		if(templateKind == TEMPLATE_KIND_TEMPLATE || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			auto& templateParamsJSON = objJSON["templateParameters"] = Json::Value(Json::arrayValue);
			for(auto it = templateInfo.getParameters().begin(), end = templateInfo.getParameters().end(); it!= end; ++it)
				templateParamsJSON.append((*it)->getID());
		}

		// reference to original template and template arguments
		if(templateKind == TEMPLATE_KIND_SPECIALIZATION || templateKind == TEMPLATE_KIND_PARTIAL_SPECIALIZATION)
		{
			objJSON["templateDeclaration"] = templateInfo.getTemplateDeclaration()->getID();

			auto& templateArgsJSON = objJSON["templateArguments"] = Json::Value(Json::arrayValue);
			for(auto it = templateInfo.getArguments().begin(), end = templateInfo.getArguments().end(); it!= end; ++it)
				templateArgsJSON.append((*it)->getID());
		}
	}

	Json::Value& JSON_Converter::convertASTObjectToJSON(ASTObject& astObject, Json::Value& objJSON,  int options_)
	{
		ASTObjectKind kind = astObject.getKind();

		// setting some default options
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
			case KIND_TEMPLATE_PACK_ARGUMENT:               options = options & ~ADD_ISDEFINITION & ~ADD_DEFINITION & ~ADD_DECLARATIONS &~ADD_NAME & ~ADD_DISPLAYNAME & ~ADD_USR; break;
		}

		addASTObjectToExportedList(astObject);
		

		// setting some common properties
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
		
		// setting properties for a specific kind of ASTObject
		switch(kind)
		{
			case KIND_NAMESPACE:
				{
					break;
				}
			
			case KIND_TYPEDEF:
				{
					auto& astObjectTypedef = static_cast<ASTObject_Typedef&>(astObject);

					// type
					objJSON["type"] = astObjectTypedef.getType()->getID();

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

					// template info
					auto& templateInfo = astObjectStruct.getTemplateInfo();
					addTemplateInfo(templateInfo, objJSON, options);

					break;
				}

			case KIND_TEMPLATE_TYPE_ARGUMENT:
				{
					auto& astObjectTemplArg = static_cast<ASTObject_TemplateTypeArgument&>(astObject);
					objJSON["type"] = astObjectTemplArg.getType()->getID();
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
					objJSON["type"] = astObjectVar.getType()->getID();

					break;
				}
			case KIND_FIELD:
				{
					auto& astObjectField = static_cast<ASTObject_Field&>(astObject);

					// props
					objJSON["access"]   = getASTObjectAccessString(astObjectField.getAccess());
					objJSON["isStatic"] = astObjectField.isStatic();
					objJSON["type"] = astObjectField.getType()->getID();

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
						objJSON["returnType"] = astObjectFunc.getReturnType()->getID();
					}

					// parameters
					if(kind != KIND_DESTRUCTOR)
					{
						auto& parametersJSON = objJSON["parameters"] = Json::Value(Json::arrayValue);
						auto& parameters = astObjectFunc.getParameters();
						for(auto it = parameters.begin(), end = parameters.end(); it != end; ++it)
							parametersJSON.append((*it)->getID());
					}

					// template info
					auto& templateInfo = astObjectFunc.getTemplateInfo();
					addTemplateInfo(templateInfo, objJSON, options);

					break;
				}
			case KIND_PARAMETER:
				{
					auto& astObjectParam = static_cast<ASTObject_Parameter&>(astObject);

					objJSON["type"] = astObjectParam.getType()->getID();

					break;
				}

			case KIND_ENUM:
				{
					break;
				}
			case KIND_ENUMCONSTANT:
				{
					auto& astObjectEnumConstant = static_cast<ASTObject_EnumConstant&>(astObject);
					
					objJSON["value"] = astObjectEnumConstant.getValue();
				}
		}

		// adding children
		auto& children = astObject.getChildren();
		if(children.size() > 0)
		{
			auto& childrenJSON = objJSON["children"] = Json::Value(Json::arrayValue);

			for(auto it = children.begin(), end = children.end(); it!= end; ++it)
				convertASTObjectToJSON(**it, childrenJSON.append(Json::Value(Json::objectValue)));
		}

		return objJSON;
	}

	// TODO: put into class
	/** Converts the entries of the given logger to JSON array entries
	 *
	 * \param   logger    Logger to convert
	 * \param   jsonObj   JSON Array to save entries into
	 */
	void convertLoggerToJSON(const Logger& logger, Json::Value& arrayValue)
	{
		auto& messages = logger.getMessages();
		for(auto it = messages.begin(), end = messages.end(); it != end; ++it)
		{
			auto& entry = arrayValue.append(Json::Value(Json::objectValue));
			entry["message"] = it->message;

			switch(it->type)
			{
				case MESSAGE_INFO: 
					entry["type"] = "Info";
					break;
				case MESSAGE_WARNING: 
					entry["type"] = "Warning";
					break;
				case MESSAGE_ERROR: 
					entry["type"] = "Error";
					break;
			}
		}
	}


	void JSON_Converter::convertToJSON(std::string& str)
	{
		m_unknownMissingASTObjects = false;
		m_ASTObjects.clear();

		Json::Value output(Json::objectValue);
		auto& AST = output["AST"] = Json::Value(Json::objectValue);

		AST["translationUnitFilename"] = m_ast->getTranlationUnitFilename();

		//converting ASTTypes
		auto& jsonTypes = AST["types"] = Json::Value(Json::arrayValue);
		auto& types = m_ast->getASTTypes();
		for(auto it = types.begin(), end = types.end(); it != end; ++it)
			convertASTTypeToJSON(*(it->second), jsonTypes.append(Json::Value(Json::objectValue)));

		// converting ASTObjects
		convertASTObjectToJSON(*(m_ast->getRootTreeNode()->getASTObject()), AST["root"]);

		// creating export log
		Logger exportLogger;
		if(m_unknownMissingASTObjects)
			exportLogger.addError("Unknown missing objects");

		for(auto itM = m_ASTObjects.begin(), endM = m_ASTObjects.end(); itM != endM; ++itM)
		{
			if(itM->second == REFERENCED)
			{
				exportLogger.addError(std::string("ASTObject not exported: ") + itM->first->getNodeName());
				//std::cout << "ERROR MISSING: " << itM->first->getID() << std::endl;
			}
			else if(itM->second == EXPORTED_AND_REFERENCED)
			{
				//std::cout << "INFO REFERENCED: " << itM->first->getID() << std::endl;
			}
		}

		// exporting logs
		auto& log = output["log"];
		
		auto& logClang  = log["Clang"]  = Json::Value(Json::arrayValue);
		auto& logExport = log["Export"] = Json::Value(Json::arrayValue);
		convertLoggerToJSON(m_ast->getLogger(), logClang);
		convertLoggerToJSON(exportLogger, logClang);

		// exporting JSON to string
		Json::StyledWriter writer;
		str = writer.write( output );
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