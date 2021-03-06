var EXPORTED_SYMBOLS = ["ResultTabbox"];

Components.utils.import("chrome://bound/content/modules/Bound.jsm");

Components.utils.import("chrome://bound/content/modules/UI/Widgets/ObjectExplorer.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/MetaDataHandler.jsm");

var MainWindow = null;
var document = null;

// TODO rename to ResultExplorer
/**
 * Represents the result object explorer
 * @type Object 
 */
var ResultTabbox = {
	
	/**
	 * Initializes the result tabbox
	 * 
	 * @param   {Object}   mainWindowModule   JSM for the main window
	 */
	init: function init(mainWindowModule)
	{
		MainWindow = mainWindowModule;
		document = MainWindow.$document;
		
		//this.$resultTabbox = document.getElementById("resultTabbox");
		//this.$resultTabs = document.getElementById("resultTabs");
		//this.$resultTabPanels = document.getElementById("resultTabPanels");
		this.$resultObjectExplorer = document.getElementById("resultObjectExplorer");
		createObjectExplorer(this.$resultObjectExplorer);
		this.$label = document.getElementById("resultLabel");
		
	},
	
	/**
	 * Displays the result of the code generation
	 * 
	 * @param   {Export_ASTObject}   exportASTObject   Export object to show result for
	 */
	displayCodeGenResult: function displayCodeGenResult(exportASTObject)
	{
		var codeGen = exportASTObject.getCodeGenerator(Bound.currentContext);
		var isValid = codeGen.prepareAndDiagnose(true);
		
		MainWindow.LogBox.codeGenLogger.addInfoMessage("=== Generating: " + exportASTObject.name + " ===");
		var result = null;
		if(!isValid)
		{
			this.$label.value = "Result: ERRORS DETECTED!!! Check diagnosis.";
			result = codeGen._genInput;
			MainWindow.LogBox.codeGenLogger.addInfoMessage("Errors detected. List follows.");
			MainWindow.LogBox.showDiagnosisMessages(exportASTObject, Bound.currentContext, true);
		}
		else
		{
			this.$label.value = "Result: Success!";
			MainWindow.LogBox.codeGenLogger.addInfoMessage("No errors detected");
			result = codeGen.generate();
		}
		
		var handler = new MetaDataHandler(result, true, true);
		this.$resultObjectExplorer.setDataHandler(handler);
		
		// to delete
		//emptyDOMElement(this.$resultTabs);
		//emptyDOMElement(this.$resultTabPanels);
		//	
		//if(genResult["files"])
		//{
		//	for(var fileName in genResult["files"])
		//	{
		//		//textResult += fileName + ":\n\n" + genResult["files"][fileName] + "\n\n";
		//		
		//		var $newTab = document.createElement("tab");
		//		$newTab.setAttribute("label", fileName);
		//		$newTab.setAttribute("tooltiptext", fileName);
		//		$newTab.setAttribute("crop", "start");
		//		this.$resultTabs.appendChild($newTab);
		//		
		//		var $newTabPanel = document.createElement("tabpanel");
		//		this.$resultTabPanels.appendChild($newTabPanel);
		//		
		//		var $newTextbox = document.createElement("textbox");
		//		$newTextbox.setAttribute("flex", "1");
		//		$newTextbox.setAttribute("multiline", "true");
		//		$newTabPanel.appendChild($newTextbox);
		//		
		//		$newTextbox.value = genResult["files"][fileName];
		//	}
		//}
		//else
		//{
		//	var $newTab = document.createElement("tab");
		//	$newTab.setAttribute("label", "Info");
		//	this.$resultTabs.appendChild($newTab);
		//	
		//	var $newTabPanel = document.createElement("tabpanel");
		//	this.$resultTabPanels.appendChild($newTabPanel);
		//	
		//	var $newTextbox = document.createElement("textbox");
		//	$newTextbox.setAttribute("flex", "1");
		//	$newTextbox.setAttribute("multiline", "true");
		//	$newTabPanel.appendChild($newTextbox);
		//	
		//	var textResult = stringifyRecursive(genResult, 0);
		//	$newTextbox.value = textResult;
		//}
		//
		//this.$resultTabbox.selectedIndex = 0;
	}
	
};

// TODO: remove
function stringifyRecursive(obj, level)
{
	var str = "";
	for(var member in obj)
	{
		switch(typeof(obj[member]))
		{
			case "boolean":
			case "string":
			case "number":
			case "undefined":
				str += member + ": " + obj[member] + "\n\n";
				break;
			case "object":
				if(obj[member])
				{
					if(obj[member].constructor && (obj[member].constructor.name === "Object" || obj[member].constructor.name === "Array") )
						str += member + ":\n\n" + stringifyRecursive(obj[member], level + 1) + "\n\n";
					else
						str += member + ": object\n\n";
				}
				else
					str += member + ": null\n\n";
				
				break;
		}
	}
	
	return str;
}

// TODO: remove
function objToString(obj)
{
	var str = "";
	for(var member in obj)
		str += member + ":\n\n" + obj[member] + "\n\n";
		
	return str;
}

// TODO: move to DOMHelpers
/**
 * Removes all elements from the given element
 * 
 * @param   {element}   elem 
 */
function emptyDOMElement(elem)
{
	while(elem.firstChild)
		elem.removeChild(elem.firstChild);
}
