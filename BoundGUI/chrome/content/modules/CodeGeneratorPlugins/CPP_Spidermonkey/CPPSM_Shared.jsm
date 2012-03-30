/*global Components, CPP_ASTObject, CodeGeneratorPluginManager, TemplateManager */

var EXPORTED_SYMBOLS = ["isValidIdentifier", "isCompatible", "setCPPSM_CodeGenObject"];

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/AST/Base_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/LoadSaveFromMetaData.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/ObjectHelpers.jsm");

//======================================================================================

var regexJSIdentifier = /^[$A-Z_][0-9A-Z_$]*$/i;

/**
 * Checks a given string, if it is a valid JavaScript identifier
 * 
 * @param   {string}   identifier   Identifier to check
 * 
 * @returns {boolean}   True if valid, otherwise false
 */
function isValidIdentifier(identifier)
{
	return regexJSIdentifier.test(identifier);
}

var CPPSM_CodeGenObject = null;

function isCompatible(astObject, exportParent)
{
	// check the source language
	// only C++ and custom ASTObjects allowed
	
	if( !(astObject instanceof CPP_ASTObject)
		/* ||
		!(astObject instanceof ASTOverloadContainer && astObject.overloads[0] instanceof CPP_ASTObject)*/)
		return false;
	
	// root object hack
	if(astObject.parent == null)
		return true;
	
	if(!exportParent)
		return false;
	
	var parentCodeGen = exportParent.getCodeGenerator("CPP_Spidermonkey");
	
	if(!parentCodeGen || !(parentCodeGen instanceof CPPSM_CodeGenObject))
		return false;
	
	return true;
}

// TODO: have better idea, currently we want to defeat cyclic dependencies
function setCPPSM_CodeGenObject(codeGen)
{
	CPPSM_CodeGenObject = codeGen;
}
