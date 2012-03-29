
Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Bound.jsm");
Components.utils.import("chrome://bound/content/modules/UI/Widgets/ObjectExplorer.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/MetaDataHandler.jsm");

Components.utils.import("resource://gre/modules/Services.jsm");

var newOptions = null;

function saveOptions()
{
	window.close();
}

function onLoad()
{
	this.$appOptionsExplorer = document.getElementById("appOptionsExplorer");
	createObjectExplorer(this.$appOptionsExplorer);
	
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