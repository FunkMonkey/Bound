var EXPORTED_SYMBOLS = ["ResultTabbox"];

Components.utils.import("chrome://bound/content/modules/Bound.jsm");

var MainWindow = null;
var document = null;

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
		
		this.$resultTabbox = document.getElementById("resultTabbox");
		this.$resultTabs = document.getElementById("resultTabs");
		this.$resultTabPanels = document.getElementById("resultTabPanels");
		
	},
	
	displayCodeGenResult: function displayCodeGenResult(exportASTObject)
	{
		var genResult = exportASTObject.getCodeGenerator(Bound.currentContext).generate();
		
		emptyDOMElement(this.$resultTabs);
		emptyDOMElement(this.$resultTabPanels);
			
		if(genResult["files"])
		{
			for(var fileName in genResult["files"])
			{
				//textResult += fileName + ":\n\n" + genResult["files"][fileName] + "\n\n";
				
				var $newTab = document.createElement("tab");
				$newTab.setAttribute("label", fileName);
				$newTab.setAttribute("tooltiptext", fileName);
				$newTab.setAttribute("crop", "start");
				this.$resultTabs.appendChild($newTab);
				
				var $newTabPanel = document.createElement("tabpanel");
				this.$resultTabPanels.appendChild($newTabPanel);
				
				var $newTextbox = document.createElement("textbox");
				$newTextbox.setAttribute("flex", "1");
				$newTextbox.setAttribute("multiline", "true");
				$newTabPanel.appendChild($newTextbox);
				
				$newTextbox.value = genResult["files"][fileName];
			}
		}
		else
		{
			var $newTab = document.createElement("tab");
			$newTab.setAttribute("label", "Info");
			this.$resultTabs.appendChild($newTab);
			
			var $newTabPanel = document.createElement("tabpanel");
			this.$resultTabPanels.appendChild($newTabPanel);
			
			var $newTextbox = document.createElement("textbox");
			$newTextbox.setAttribute("flex", "1");
			$newTextbox.setAttribute("multiline", "true");
			$newTabPanel.appendChild($newTextbox);
			
			var textResult = ""
			for(var code in genResult)
			{
				textResult += code + ":\n\n" + genResult[code] + "\n\n";
			}
			
			$newTextbox.value = textResult;
		}
		
		this.$resultTabbox.selectedIndex = 0;
	}
	
};

function objToString(obj)
{
	var str = "";
	for(var member in obj)
		str += member + ":\n\n" + obj[member] + "\n\n";
		
	return str;
}

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
