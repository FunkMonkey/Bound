
Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Bound.jsm");
Components.utils.import("chrome://bound/content/modules/UI/Widgets/ObjectExplorer.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaDataHandler.jsm");

Components.utils.import("chrome://bound/content/modules/Project/Project.jsm");

Components.utils.import("resource://gre/modules/Services.jsm");

//Components.utils.import("chrome://bound/content/modules/Utils/MetaData.jsm");



var newOptions = null;

/**
 * Saves the options
 */
function saveOptions()
{
	projOptions = Bound.currentProject.options;
	
	try
	{
		new RegExp(newOptions.fileNameFilter);
		
	}
	catch(e)
	{
		alert("Error: Filename filter is malformed regular expression");
		return;
	}
	
	try
	{
		new RegExp(newOptions.symbolNameFilter);
	}
	catch(e)
	{
		alert("Error: Symbolname filter is malformed regular expression");
		return;
	}
	
	projOptions.clangArguments    = newOptions.clangArguments;
	projOptions.fileNameFilter    = newOptions.fileNameFilter;
	projOptions.symbolNameFilter  = newOptions.symbolNameFilter;
	projOptions.accessFilter	  = newOptions.accessFilter;
	Services.prefs.setCharPref("bound.lastProject.clangArguments", projOptions.clangArguments);
	Services.prefs.setCharPref("bound.lastProject.fileNameFilter", projOptions.fileNameFilter);
	Services.prefs.setCharPref("bound.lastProject.symbolNameFilter", projOptions.symbolNameFilter);
	Services.prefs.setIntPref("bound.lastProject.accessFilter", projOptions.accessFilter);
	
	window.close();
}

/**
 * Called when window is loaded
 */
function onLoad()
{
	this.$projectOptionsExplorer = document.getElementById("projectOptionsExplorer");
	createObjectExplorer(this.$projectOptionsExplorer);
	
	projOptions = Bound.currentProject.options;
	
	newOptions = new ProjectOptions();
	
	newOptions.clangArguments    = projOptions.clangArguments;
	newOptions.fileNameFilter    = projOptions.fileNameFilter;
	newOptions.symbolNameFilter  = projOptions.symbolNameFilter;
	newOptions.accessFilter	     = projOptions.accessFilter;
	
	var handler = new MetaDataHandler(newOptions);
	
	this.$projectOptionsExplorer.setDataHandler(handler);
}

window.addEventListener("load", onLoad)