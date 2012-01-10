var EXPORTED_SYMBOLS = ["TemplateManager", "TemplateNotFoundException"];

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/CustomException.jsm");
Components.utils.import("chrome://bound/content/modules/jSmart.jsm");

var IOService = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
var ChromeRegistry = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService(Components.interfaces.nsIChromeRegistry);

var TemplateNotFoundException =                  createExceptionClass("TemplateNotFound",                  "Could not find template with name: ");
var TemplateAlreadyExistingException =           createExceptionClass("TemplateAlreadyExisting",           "The template is already existing: ");
var TemplateUnableToResolveSearchPathException = createExceptionClass("TemplateUnableToResolveSearchPath", "Cannot resolve the template search path: ");
var TemplateFileNotExistingException =           createExceptionClass("TemplateFileNotExisting",           "The template file cannot be resolved within the search paths: ");

var TemplateManager = {
	_templates: {},
	
	_templateSearchPaths: [],
	
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
	 * @param   {String}          templateName   Name to save the template
	 * @param   {jSmart|String}   template       jSmart template or String to construct it
	 *
	 * @returns {jSmart}   Template, that was added and may have been constructed
	 */
	addTemplate: function addTemplate(templateName, template)
	{
		if(this._templates[templateName])
			throw new TemplateAlreadyExistingException(templateName);
			
		if(!(template instanceof jSmart))
		{
			template = new jSmart(template);
		}
		
		this._templates[templateName] = template;
		
		return template;
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
			
		var templateStr = readFile(fileToLoad);
		
		searchTerm = searchTerm.replace(/\\/, "/");
		return this.addTemplate(searchTerm, (alternativeName == null) ? templateStr : alternativeName);
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
			throw new TemplateNotFoundException(templateName);
			
		return this._templates[templateName].fetch(data);
	},
	
	/**
	 * Checks for the existence of a template
	 * 
	 * @param   {String}   templateName   Name of the template
	 * 
	 * @returns {boolean}   True if exists, otherwise false
	 */
	hasTemplate: function hasTemplate(templateName)
	{
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
		return (this._templates[templateName] == null) ? null : this._templates[templateName];
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

