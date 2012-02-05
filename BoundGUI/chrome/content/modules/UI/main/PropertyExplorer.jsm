var EXPORTED_SYMBOLS = ["initPropertyExplorer", "getPropertyExplorer"];

Components.utils.import("chrome://bound/content/modules/UI/Widgets/ObjectExplorer.jsm");

var MainWindow = null;
var document = null;

var $propertyExplorer = null;

/**
 * Initializes the property explorer
 * 
 * @param   {Object}   mainWindowModule   JSM for the main window
 */
function initPropertyExplorer(mainWindowModule)
{
	MainWindow = mainWindowModule;
	document = MainWindow.$document;
	
	$propertyExplorer = document.getElementById("propertyExplorer");
	createObjectExplorer($propertyExplorer);
	
	return $propertyExplorer;
}

/**
 * Returns the PropertyExplorer
 * 
 * @returns {Object}   PropertyExplorer
 */
function getPropertyExplorer()
{
	return $propertyExplorer;
}



