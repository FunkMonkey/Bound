/*global jSmart:true, Components:true,  createExceptionClass: true */

var EXPORTED_SYMBOLS = ["TemplateManager", "TemplateNotFoundException", "jSmart"];

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/ExceptionHandling.jsm");
Components.utils.import("chrome://bound/content/modules/Templates/jSmart.jsm");

var IOService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
var ChromeRegistry = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIChromeRegistry);

var TemplateNotFoundException =                  createExceptionClass("TemplateNotFound",                  "Could not find template with name: ");
var TemplateAlreadyExistingException =           createExceptionClass("TemplateAlreadyExisting",           "The template is already existing: ");
var TemplateUnableToResolveSearchPathException = createExceptionClass("TemplateUnableToResolveSearchPath", "Cannot resolve the template search path: ");
var TemplateFileNotExistingException =           createExceptionClass("TemplateFileNotExisting",           "The template file cannot be resolved within the search paths: ");

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
Components.utils.import("resource://gre/modules/Services.jsm");

//======================================================================================

/**
 * Represents a template (includes a jSmart)
 * @constructor
 *
 * @property   {jSmart}   template       The jSmart template
 * @property   {string}   templateCode   The source code for the jSmart template
 */
function Template()
{
	this.template = null; // TODO: rename to jSmartTemplate
	this.templateCode = "";
}

Template.prototype = {
	
	/**
	 * Initializes the template
	 */
	init: function init()
	{
		this.template = new jSmart(this.templateCode);
	}, 
	
	
	/**
	 * Fetches the given template
	 * 
	 * @param   {Object}   data   Fetch data
	 * 
	 * @returns {string}   Result of template
	 */
	fetch: function fetch(data)
	{
		// calling onFetchBefore
		if(this.onFetchBefore)
			this.onFetchBefore(data);
		
		// fetching the result
		var result = this.template.fetch(data);
		
		// calling onFetchAfter
		if(this.onFetchAfter)
			result = this.onFetchAfter(data, result);
		
		return result;
	}, 
	
};

Object.defineProperty(Template.prototype, "constructor", {value: Template});

//======================================================================================

/**
 * Manages templates and handles loading
 * @type Object
 */
var TemplateManager = {
	
	/**
	 * The loaded templates. Mapped by ID / subpath
	 * @type Object<Template>
	 */
	_templates: {},
	
	jSmart: jSmart,
	
	/**
	 * Search paths for templates
	 * @type nsIFile[]
	 */
	_templateSearchPaths: [],
	
	autoloadTemplates: true,
	
	/**
	 * Adds a path for searching template files
	 * 
	 * @param   {string}   URLspec   Path to search for as a fileURL
	 * 
	 * @returns {nsIFile}   File object
	 */
	addTemplateSearchPath: function addTemplateSearchPath(URLspec)
	{
		var file = null;		
		
        var uri = IOService.newURI(URLspec, "UTF-8", null);
		if(uri instanceof Components.interfaces.nsIFileURL)
		{
			uri.QueryInterface(Components.interfaces.nsIFileURL);
			file = uri.file;
		}
		else if(/^chrome/gi.test(URLspec))
		{
			try
			{
				var fileURL = ChromeRegistry.convertChromeURL(uri);
				fileURL.QueryInterface(Components.interfaces.nsIFileURL);
				file = fileURL.file;
			}
			catch(e)
			{
				throw new TemplateUnableToResolveSearchPathException(URLspec);
			}
			
		}
		
		if(file.exists())
		{
			if(file.isDirectory())
				this._templateSearchPaths.push(file);
			else
				throw new TemplateUnableToResolveSearchPathException(URLspec + " is not a directory");
		}
		else
			throw new TemplateUnableToResolveSearchPathException(URLspec + " does not exist");
		
		return file;
	}, 

	
	/**
	 * Loads a template from a file, directories will be split
	 * 
	 * @param   {string}   searchTerm        File search term
	 * @param   {string}   alternativeName   Alternative name for saving
	 * 
	 * @returns {Template}   Created template
	 */
	loadTemplateFromFile: function loadTemplateFromFile(searchTerm, alternativeName)
	{
		
		var searchSplit = searchTerm.split(/[\/\\]/);
		var fileNameWOExt = searchSplit.pop();
		
		var jsmartFile = null;
		var jsFile = null;
		
		var jsmartExists = false;
		var jsExists = false;
		
		for(var i = 0; i < this._templateSearchPaths.length; ++i)
		{
			var path = this._templateSearchPaths[i].clone();
			
			for(var j = 0; j < searchSplit.length; ++j)
			{
				path.append(searchSplit[j]);
			}
			
			jsmartFile = path.clone();
			jsmartFile.append(fileNameWOExt + ".jsmart")
			jsFile = path.clone();
			jsFile.append(fileNameWOExt + ".js")
			
			jsmartExists = jsmartFile.exists();
			jsExists = jsFile.exists();
			
			if(jsmartExists || jsExists)
				break;
		}
		
		if(!jsmartExists && !jsExists)
			throw new TemplateFileNotExistingException(searchTerm);
		
		var template = new Template();
		template.name = (alternativeName == null) ? searchTerm : alternativeName;
		
		if(jsmartExists)
		{
			var jsmartText = readFile(jsmartFile);
			template.templateCode = jsmartText;
		}
		
		if(jsExists)
		{
			template.TemplateManager = TemplateManager;
			var fileURL = Services.io.newFileURI(jsFile).spec;
			loader.loadSubScript(fileURL, template);
		}
		
		template.init();
		
		this._templates[template.name] = template;
		
		return template;
			
		/*
			
		var templateJSONStr = readFile(fileToLoad);
		try
		{
			var templateData = this._templateStringToJSON(templateJSONStr);
		}
		catch(e)
		{
			throw new Error("Could not parse template file: " + searchTerm + " (" + e.message + ")");
		}

		searchTerm = searchTerm.replace(/\\/, "/");
		return this.addTemplate((alternativeName == null) ? searchTerm : alternativeName, templateData);*/
	},
	
	// TODO: can be removed
	/**
	 * Escapes some control characters
	 * 
	 * @param   {string}   str   String to escape
	 * 
	 * @returns {string}
	 */
	_escape: function _escape(str)
	{
		// Damn pesky carriage returns...
		str = str.replace(/\r\n/gm, "\n");
		str = str.replace(/\r/gm, "\n");
	
		// JSON requires new line characters be escaped
		str = str.replace(/\n/gm, "\\n");
		str = str.replace(/\t/gm, "\\t");
		
		return str;
	}, 
	
	// TODO: can be removed
	/**
	 * Converts a given template String (stringified JSON) to JSON
	 *    - will escape tabs and newlines
	 * 
	 * @param   {String}   fullTemplateString   The string to parse
	 * 
	 * @returns {Object}   JSON
	 */
	_templateStringToJSON: function _templateStringToJSON(fullTemplateString)
	{
		var finString = "";
		var splits = fullTemplateString.split('"');
		var quoteOpen = false;
		for(var i = 0; i < splits.length; ++i)
		{
			//log(((quoteOpen == true) ? "*": "") + " Progressing: " + splits[i])
			finString += (quoteOpen == true) ? this._escape(splits[i]) : splits[i];
			finString += (i !== splits.length - 1) ? '"' : "";
			
			var subStr = splits[i];
			if(subStr.length == 0 || (subStr.length > 0 && subStr.charAt(subStr.length-1) !== '\\'))
			{
				quoteOpen = !quoteOpen;
			}
		}
		
		//log("tryping to parse: " + finString);
		
		return JSON.parse(finString);
	}, 
	
	// TODO: do we really need this?
	/**
	 * Fetches the template with the given name
	 * 
	 * @param   {string}   templateName   Name of the template to fetch
	 * @param   {Object}   data           Data to pass to the template engine
	 * 
	 * @returns {string}   Result string with inserted data
	 */
	fetch: function fetch(templateName, data)
	{
		if(!this._templates[templateName])
		{
			if(this.autoloadTemplates)
				return this.loadTemplateFromFile(templateName).fetch(data);
			else
				throw new TemplateNotFoundException(templateName);
		}
			
		return this._templates[templateName].fetch(data);
	},
	
	/**
	 * Checks for the existence of a template
	 * 
	 * @param   {string}   templateName   Name of the template
	 * 
	 * @returns {boolean}   True if exists, otherwise false
	 */
	hasTemplate: function hasTemplate(templateName, autoLoad)
	{
		if(autoLoad)
			this.loadTemplateFromFile(templateName);
		
		return (this._templates[templateName] == null) ? false : true;
	},
	
	/**
	 * Returns the template with the given name
	 * 
	 * @param   {string}   templateName   Name of the template
	 * 
	 * @returns {Template}   Found template or null
	 */
	getTemplate: function getTemplate(templateName)
	{
		if(this._templates[templateName] == null)
		{
			if(this.autoloadTemplates)
				return this.loadTemplateFromFile(templateName);
			else
				return null;
		}
		
		return this._templates[templateName];
	}, 
	
};

// TODO: move to IO module
function readFile(file)
{
    // open an input stream from file  
    var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].  
                  createInstance(Components.interfaces.nsIFileInputStream);  
    istream.init(file, 0x01, 0444, 0);  
    istream.QueryInterface(Components.interfaces.nsILineInputStream);  
      
    // read lines into array  
    var line = {}, lines = [], hasmore;
	var str = "";
    do {  
      hasmore = istream.readLine(line);  
      str += line.value + ((hasmore == true) ? "\n" : "");   
    } while(hasmore);  
      
    istream.close();
	
	return str;
}

TemplateManager.addTemplateSearchPath("chrome://bound/content/codegen_templates/");

//TemplateManager.loadTemplateFromFile("CPP_Spidermonkey/test");
//log(TemplateManager.fetch("CPP_Spidermonkey/test", {funcName: "supertest"}));

