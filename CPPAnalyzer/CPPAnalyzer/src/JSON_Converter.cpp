#include "JSON_Converter.hpp"

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

#include "ASTType.hpp"

// TEMP
#include <iostream>

namespace CPPAnalyzer
{
	void JSON_Converter::convertAllChildrenToJSON(ASTObject& astObject, std::stringstream& ss, int depth)
	{
		auto& children = astObject.getChildren();
		auto it = children.begin();
		auto end = children.end();

		for(; it!= end; ++it)
		{
			bool added = convertToJSON(*(*it), ss, depth+2);
			if(it+1 != end && added)
				ss << "," << m_lineBreak;
		}
		ss << m_lineBreak;
	}

	void JSON_Converter::addProperty(const std::string& propName, const std::string& value, std::stringstream& ss, const std::string& indent, bool isLast)
	{
		addProperty(propName, value.c_str(), ss, indent, isLast);
	}

	void JSON_Converter::addProperty(const std::string& propName, const char* value, std::stringstream& ss, const std::string& indent, bool isLast)
	{
		ss << indent << '"' << propName << "\": \"" << value << "\"";
		if(!isLast)
			ss << ",";
			
		ss << m_lineBreak;
	}

	void JSON_Converter::addProperty(const std::string& propName, unsigned int value, std::stringstream& ss, const std::string& indent, bool isLast)
	{
		ss << indent << '"' << propName << "\": " << value;
		if(!isLast)
			ss << ",";

		ss << m_lineBreak;
	}

	void JSON_Converter::addProperty(const std::string& propName, float value, std::stringstream& ss, const std::string& indent, bool isLast)
	{
		ss << indent << '"' << propName << "\": " << value;
		if(!isLast)
			ss << ",";

		ss << m_lineBreak;
	}

	void JSON_Converter::addProperty(const std::string& propName, bool value, std::stringstream& ss, const std::string& indent, bool isLast)
	{
		ss << indent << '"' << propName << "\": " << ((value) ? "true" : "false");
		if(!isLast)
			ss << ",";

		ss << m_lineBreak;
	}

	void JSON_Converter::addLine(const std::string& line, std::stringstream& ss, const std::string& indent)
	{
		ss << indent << line << m_lineBreak;
	}

	void JSON_Converter::convertToJSON(ASTType& type, std::stringstream& ss, int depth)
	{
		// TEMP indent, TODO: performance
		std::string indent_min;
		for(int i = 0; i < depth; ++i)
			indent_min += m_indent;

		std::string indent = indent_min + m_indent;

		// --------------------
		addLine("{", ss, indent_min);
		addProperty("kind", type.getKind(), ss, indent);
		addProperty("isConst", type.isConst(), ss, indent, !(type.getDeclaration() || type.getPointsTo()));

		if((type.getKind() == "Record" || type.getKind() == "Typedef") && type.getDeclaration())
		{
			addProperty("declaration", type.getDeclaration()->getID(), ss, indent, true);
		}
		else if((type.getKind() == "Pointer" || type.getKind() == "LValueReference") && type.getPointsTo())
		{
			ss << indent << "\"pointsTo\":" << m_lineBreak;
			convertToJSON(*type.getPointsTo(), ss, depth +2);
			ss << m_lineBreak;
		}

		ss << indent_min << "}";
	}

	bool JSON_Converter::convertToJSON(ASTObject& astObject, std::stringstream& ss, int depth)
	{
		// TEMP indent, TODO: performance
		std::string indent_min;
		for(int i = 0; i < depth; ++i)
			indent_min += m_indent;

		std::string indent = indent_min + m_indent;

		ASTObjectKind kind = astObject.getKind();
		switch(kind)
		{
			case KIND_NAMESPACE:
				{
					addLine("{", ss, indent_min);

					// common props
					addProperty("name", astObject.getNodeName(), ss, indent);
					addProperty("kind", getASTObjectKind(astObject.getKind()), ss, indent);
					addProperty("id", astObject.getID(), ss, indent);

					// adding children
					addLine("\"children\": [", ss, indent);
					convertAllChildrenToJSON(astObject, ss, depth);
					addLine("],", ss, indent);

					// USR
					addProperty("USR", astObject.getUSR(), ss, indent, true);

					// end of object
					ss << indent_min <<  "}";

					break;
				}
			
			case KIND_TYPEDEF:
				{
					ASTObject_Typedef& astObjectTypedef = static_cast<ASTObject_Typedef&>(astObject);

					addLine("{", ss, indent_min);

					// common props
					addProperty("name", astObject.getNodeName(), ss, indent);
					addProperty("kind", getASTObjectKind(astObject.getKind()), ss, indent);
					addProperty("id", astObject.getID(), ss, indent);

					// access
					addLine("\"type\": ", ss, indent);
					convertToJSON(*astObjectTypedef.getType(), ss, depth+2);
					ss << "," << m_lineBreak;

					addLine("\"typeCanonical\": ", ss, indent);
					convertToJSON(*astObjectTypedef.getTypeCanonical(), ss, depth+2);
					ss << "," << m_lineBreak;

					// USR
					addProperty("USR", astObject.getUSR(), ss, indent, true);

					// end of object
					ss << indent_min <<  "}";

					break;
				}
			case KIND_STRUCT:
			case KIND_CLASS:
				{
					auto astObjectStruct = static_cast<ASTObject_Struct&>(astObject);

					addLine("{", ss, indent_min);

					// common props
					addProperty("name", astObject.getNodeName(), ss, indent);
					addProperty("kind", getASTObjectKind(astObject.getKind()), ss, indent);
					addProperty("id", astObject.getID(), ss, indent);
					
					// adding bases
					addLine("\"bases\": [", ss, indent);

					auto bases = astObjectStruct.getBases();
					for(auto it = bases.begin(); it != bases.end(); ++it)
					{
						ss << indent << m_indent << (*it).base->getID();
						if(it+1 != bases.end())
							ss << "," << m_lineBreak;
					}

					addLine("],", ss, indent);
					
					// adding children
					addLine("\"children\": [", ss, indent);
					convertAllChildrenToJSON(astObject, ss, depth);
					addLine("],", ss, indent);

					// USR
					addProperty("USR", astObject.getUSR(), ss, indent, true);

					// end of object
					ss << indent_min <<  "}";

					break;
				}
			case KIND_FIELD:
				{
					ASTObject_Field& astObjectField = static_cast<ASTObject_Field&>(astObject);

					addLine("{", ss, indent_min);

					// common props
					addProperty("name", astObject.getNodeName(), ss, indent);
					addProperty("kind", getASTObjectKind(astObject.getKind()), ss, indent);
					addProperty("id", astObject.getID(), ss, indent);

					// access
					addProperty("access", getASTObjectAccessString(astObjectField.getAccess()), ss, indent);
					addLine("\"type\": ", ss, indent);
					convertToJSON(*astObjectField.getType(), ss, depth+2);
					ss << "," << m_lineBreak;

					addLine("\"typeCanonical\": ", ss, indent);
					convertToJSON(*astObjectField.getTypeCanonical(), ss, depth+2);
					ss << "," << m_lineBreak;

					// USR
					addProperty("USR", astObject.getUSR(), ss, indent, true);


					// end of object
					ss << indent_min <<  "}";

					break;
				}
			case KIND_FUNCTION:
			case KIND_MEMBER_FUNCTION:
			case KIND_CONSTRUCTOR:
			case KIND_DESTRUCTOR:
				{
					ASTObject_Function& astObjectFunc = static_cast<ASTObject_Function&>(astObject);

					addLine("{", ss, indent_min);

					// common props
					addProperty("name", astObject.getNodeName(), ss, indent);
					addProperty("kind", getASTObjectKind(astObject.getKind()), ss, indent);
					addProperty("id", astObject.getID(), ss, indent);
					
					ASTObject_Member_Function* astObjectMemberFunc = dynamic_cast<ASTObject_Member_Function*>(&astObject);
					if(astObjectMemberFunc)
						addProperty("access", getASTObjectAccessString(astObjectMemberFunc->getAccess()), ss, indent);
					
					// return type
					if(kind == KIND_FUNCTION || kind == KIND_MEMBER_FUNCTION)
					{
						addLine("\"returnType\": ", ss, indent);
						convertToJSON(*astObjectFunc.getReturnType(), ss, depth+2);
						ss << "," << m_lineBreak;
						addLine("\"returnTypeCanonical\": ", ss, indent);
						convertToJSON(*astObjectFunc.getReturnTypeCanonical(), ss, depth+2);
						ss << "," << m_lineBreak;
					}

					// parameters
					if(kind != KIND_DESTRUCTOR)
					{
						addLine("\"parameters\": [", ss, indent);

						auto parameters = astObjectFunc.getParameters();
						for(auto it = parameters.begin(); it != parameters.end(); ++it)
						{
							ss << indent << m_indent << "{" << m_lineBreak;
							ss << indent << m_indent << m_indent << "\"name\": \"" << (*it)->getNodeName() << "\"," << m_lineBreak;

							addLine("\"type\": ", ss, indent + m_indent + m_indent);
							convertToJSON(*(*it)->getType(), ss, depth+4);
							ss << "," << m_lineBreak;

							addLine("\"typeCanonical\": ", ss, indent + m_indent + m_indent);
							convertToJSON(*(*it)->getTypeCanonical(), ss, depth+4);
							ss << m_lineBreak;

							ss << indent << m_indent << "}";
							if(it+1 != parameters.end())
								ss << ",";

							ss << m_lineBreak;
						}

						addLine("],", ss, indent);
					}

					// USR
					addProperty("USR", astObject.getUSR(), ss, indent, true);

					// end of object
					ss << indent_min <<  "}";

					break;
				}

			default: return false;
		}

		return true;
	}

	void JSON_Converter::convertToJSON(std::string& str)
	{
		std::stringstream ss(str);
		
		convertToJSON(*(m_ast->getRootASTObject()), ss, 0);

		str = ss.str();
	}

}