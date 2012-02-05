var EXPORTED_SYMBOLS = ["TemplateManager", "TemplateNotFoundException"];

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/CustomException.jsm");
Components.utils.import("chrome://bound/content/modules/Templates/jSmart.jsm");

var IOService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
var ChromeRegistry = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIChromeRegistry);

var TemplateNotFoundException =                  createExceptionClass("TemplateNotFound",                  "Could not find template with name: ");
var TemplateAlreadyExistingException =           createExceptionClass("TemplateAlreadyExisting",           "The template is already existing: ");
var TemplateUnableToResolveSearchPathException = createExceptionClass("TemplateUnableToResolveSearchPath", "Cannot resolve the template search path: ");
var TemplateFileNotExistingException =           createExceptionClass("TemplateFileNotExisting",           "The template file cannot be resolved within the search paths: ");

var TemplateManager = {
	_templates: {},
	
	jSmart: jSmart,
	
	_templateSearchPaths: [],
	
	autoloadTemplates: true,
	
	/**
	 * Adds a path for searching template files
	 * 
	 * @param   {String}   URLspec   Path to search for as a fileURL
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
	 * Adds a template
	 * 
	 * @param   {String}                 templateName   Name to save the template
	 * @param   {jSmart|String|Object}   template       jSmart template or String to construct it or Object with String in .templateCode
	 *
	 * @returns {jSmart}   Template, that was added and may have been constructed, String in .data.templateCode, Object in .data
	 */
	addTemplate: function addTemplate(templateName, template)
	{
		if(this._templates[templateName])
			throw new TemplateAlreadyExistingException(templateName);
			
		if(template instanceof jSmart)
		{
			this._templates[templateName] = template;
			return template;
			
		}
		else if(typeof(template) === "String")
		{
			var newTemplate = new jSmart(template);
			newTemplate.userdata = {templateCode: template};
			newTemplate.name = templateName;
			this._templates[templateName] = newTemplate;
			return newTemplate;
		}
		else if(template && "templateCode" in template)
		{
			var newTemplate = new jSmart(template.templateCode);
			newTemplate.userdata = template;
			newTemplate.name = templateName;
			this._templates[templateName] = newTemplate;
			
			if("customFunctionsSource" in template)
			{
				var funcs = {};
				for(var funcName in template.customFunctionsSource)
					funcs[funcName] = Function.apply(null, template.customFunctionsSource[funcName]);
				
				newTemplate.userdata.customFunctions = funcs;
			}
			
			newTemplate._fetch = newTemplate.fetch;
			newTemplate.fetch = this._templateFetch;
			
			return newTemplate;
		}
		else
		{
			// TODO: throw exception
			return null;
		}
	},
	
	_templateFetch: function fetch(data)
	{
		if("customFunctions" in this.userdata)
		{
			for(var funcName in this.userdata.customFunctions)
			{
				this.userdata.customFunctions[funcName](data);
			}
		}
		return this._fetch(data);
	},
	
	/**
	 * Loads a template from a file, directories will be split
	 * 
	 * @param   {String}   searchTerm        File search term
	 * @param   {String}   alternativeName   Alternative name for saving
	 * 
	 * @returns {jSmart}   Created jSmart template
	 */
	loadTemplateFromFile: function loadTemplateFromFile(searchTerm, alternativeName)
	{
		var searchSplit = searchTerm.split(/[\/\\]/);
		searchSplit[searchSplit.length-1] += ".template";
		
		var fileToLoad = null;
		
		for(var i = 0; i < this._templateSearchPaths.length; ++i)
		{
			var path = this._templateSearchPaths[i].clone();
			
			for(var j = 0; j < searchSplit.length; ++j)
			{
				path.append(searchSplit[j]);
			}
				
			if(path.exists())
			{
				fileToLoad = path;
				break;
			}
		}
		
		if(!fileToLoad)
			throw new TemplateFileNotExistingException(searchTerm);
			
		var templateJSONStr = readFile(fileToLoad);
		var templateData = this._templateStringToJSON(templateJSONStr);
		
		searchTerm = searchTerm.replace(/\\/, "/");
		return this.addTemplate((alternativeName == null) ? searchTerm : alternativeName, templateData);
	},
	
	/**
	 * Escapes some control characters
	 * 
	 * @param   {String}   str   String to escape
	 * 
	 * @returns {String}
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
	
	
	/**
	 * Fetches the template with the given name
	 * 
	 * @param   {String}   templateName   Name of the template to fetch
	 * @param   {Object}   data           Data to pass to the template engine
	 * 
	 * @returns {String}   Result string with inserted data
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
	 * @param   {String}   templateName   Name of the template
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
	 * @param   {String}   templateName   Name of the template
	 * 
	 * @returns {jSmart}   jSmart template or null
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
	
	/**
	 * Calls a custom function from a template
	 * 
	 * @param   {String}   templateName   Name of the template
	 * @param   {String}   funcName       Name of the function to call
	 * @param   {Object}   data           Data to pass to the custom function
	 */
	callTemplateFunction: function callTemplateFunction(templateName, funcName, data)
	{
		var temp = this.getTemplate(templateName);
		temp.userdata.customFunctions[funcName].call(null, data);
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

