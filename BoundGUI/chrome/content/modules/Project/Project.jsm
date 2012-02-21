var EXPORTED_SYMBOLS = ["Project", "ProjectOptions"];

Components.utils.import("chrome://bound/content/modules/AST/CPP_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/AST/Export_ASTObjects.jsm");
Components.utils.import("chrome://bound/content/modules/CodeGeneratorPlugins/CPP_Spidermonkey.jsm");

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/FileIO.jsm");

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");

Components.utils.import("chrome://bound/content/modules/CPPAnalyzer.jsm");

var accessFilterValues = {};
for(var propName in CPPAnalyzer.FilterAccess)
	accessFilterValues[propName] = CPPAnalyzer.FilterAccess[propName];


function ProjectOptions()
{
	this.clangArguments =  "";
	this.fileNameFilter =  ".*";
	this.symbolNameFilter = ".*";
	this.accessFilter = 8;
}

MetaData.initMetaDataOn(ProjectOptions.prototype)
	.addPropertyData("clangArguments",   { view: { name: "Clang arguments" }})
	.addPropertyData("fileNameFilter",   { view: { name: "Filename filter" }})
	.addPropertyData("symbolNameFilter", { view: { name: "Symbolname filter" }})
	.addPropertyData("accessFilter",     { type: "dropdown", view: { name: "Access filter", dropDownValues: accessFilterValues }})

/**
 * 
 *
 * @constructor
 * @this {Project}
 */
function Project(cppAST, exportAST)
{
	this._cppAST = (cppAST == null) ? null : cppAST;
	this.exportAST = (exportAST == null) ? this._createExportAST(cppAST, "ProjectName") : exportAST;
	
	this.options = new ProjectOptions();
}

Project.prototype = {
	constructor: Project,
	
	get cppAST(){ return this._cppAST; },
	set cppAST(val)
	{
		this._cppAST = val;
		this.exportAST.sourceAST = val;
	},
	
	/**
	 * Creates a new export AST based on the given C++ AST
	 * 
	 * @param   {CPP_AST}   cppAST   C++ AST
	 */
	_createExportAST: function _createExportAST(cppAST, projectName)
	{
		var exportAST = new Export_AST(projectName);
		
		if(cppAST)
		{
			exportAST.sourceAST = cppAST;
		}
		
		// TODO: put somewhere else
		var spidermonkeyPlugin = new Plugin_CPP_Spidermonkey();
		exportAST.addCodeGeneratorPlugin(spidermonkeyPlugin);
		
		var codeGenConstructor = spidermonkeyPlugin.getCodeGeneratorByASTObject((cppAST == null) ? null : cppAST.root);
		exportAST.root.addCodeGenerator(new codeGenConstructor(spidermonkeyPlugin));
		
		return exportAST;
	},
	
	/**
	 * Saves the project to the given file
	 * 
	 * @param   {nsIFile}   file   File to save to
	 */
	saveToFile: function saveToFile(file)
	{
		var projectFile = file;
		var projectFileSplit = projectFile.leafName.split(".");
		
		// save the project
		var projectSaveObject = {
			options: this.options,
			exportAST: this.exportAST.toSaveObject()
		};
		
		FileIO.writeTextFile(JSON.stringify(projectSaveObject), projectFile);
		
		// save the CPP AST
		if(this.cppAST && this.cppAST._toSave)
		{
			var cppASTFile = projectFile.parent.clone();
			cppASTFile.append(projectFileSplit[0] + "_CPP_AST.json");
			
			var cppASTSaveData = JSON.stringify(this.cppAST.toSaveObject());
			FileIO.writeTextFile(cppASTSaveData, cppASTFile);
		}
	}, 
	
};

/**
 * Loads the project from the given file
 * 
 * @param   {nsIFile}   file   File to load from
 */
Project.loadFromFile = function loadFromFile(file)
{
	if(!file.exists())
		throw "Can not load project from file. File does not exist."
	
	var projectFile = file;
	var projectFileSplit = projectFile.leafName.split(".");
	
	// load the CPP AST
	var cppASTFile = projectFile.parent.clone();
	cppASTFile.append(projectFileSplit[0] + "_CPP_AST.json");
	
	var cppJSONStr = FileIO.readTextFile(cppASTFile);
	var cppAST = CPP_AST.createFromSaveObject(JSON.parse(cppJSONStr));
	
	var projectJSONObject = JSON.parse(FileIO.readTextFile(projectFile));
	var exportAST = Export_AST.createFromSaveObject(projectJSONObject.exportAST, cppAST);
	
	var project = new Project(cppAST, exportAST);
	project.options = projectJSONObject.options
	
	return project;
};

