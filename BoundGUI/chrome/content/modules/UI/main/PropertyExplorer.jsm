var EXPORTED_SYMBOLS = ["initPropertyExplorer"];

Components.utils.import("chrome://bound/content/modules/UI/Widgets/ObjectExplorer.jsm");
Components.utils.import("chrome://bound/content/modules/MetaDataHandler.jsm");

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
	
	var testObject = {
		member: "test",
		other: "fool",
		number: 3434,
		bool: true,
		obj: { sub1: "fool", sub2: "msfdsf"},
		otherobj: null};
	var dataHandler = new MetaDataHandler(testObject);
	
	$propertyExplorer.setDataHandler(dataHandler);
	
	return $propertyExplorer;
}


