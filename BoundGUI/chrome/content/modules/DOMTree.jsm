var EXPORTED_SYMBOLS = ["DOMTree"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;
Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/DOMHelper.jsm");

function TreeRow()
{	
	this.id = 0;
	this.isVisible = false;
	this.isContainer = false;
	this.isContainerEmpty = true;
	this.isContainerOpen = false;
	this.level = 0;
}

// TODO: create on vbox as this!
// TODO: use DOMHelper
function DOMTree(dataCB)
{
	this.isDOMTree = true;
	this.classList.add("dom-tree");
	this.dataCB = dataCB;
	
	this.selection = [];
	this._suppressSelectEvent = false;
}

DOMTree.createOn = function(element, dataCB)
{
	Extension.borrow(element, DOMTree.prototype);
	DOMTree.call(element, dataCB);
	
	return element;
}

DOMTree.prototype =
{
	//constructor: DOMTree,
	
	/**
	 * Called when clicking the dropmarker
	 * 
	 * @param   {DOMEvent}   event   Description
	 */
	_onToggleCollapse: function _onToggleCollapse(event)
	{
		event.currentTarget.parentNode.parentNode.toggleCollapse();
	},
	
	/**
	 * Toggles the collapse of a row
	 */
	_rowToggleCollapse: function _rowToggleCollapse()
	{
		if(this.isContainer)
		{
			if(this.isContainerOpen)
				this.removeAttribute("isContainerOpen");
			else
				this.setAttribute("isContainerOpen", "true");
			
			this.isContainerOpen = !this.isContainerOpen;
		}
	},
	
	/**
	 * Called when clicked on row content
	 * 
	 * @param   {MouseEvent}   event   Description
	 */
	_onRowContentClicked: function _onRowContentClicked(event)
	{
		var row = event.currentTarget.parentNode;
		var tree = row.tree;
		
		// TODO: exclude twisty
		// TODO: different keys
		
		if(event.shiftKey)
		{
			if(tree.selection.length === 0)
				tree.addToSelection(row);
			else
			{
				var firstSelected = tree.selection[0];
				tree.clearSelection();
				
				if(firstSelected.$parentRow !== row.$parentRow)
				{
					tree.addToSelection(firstSelected);
					tree.addToSelection(row);
				}
				else
				{
					var nodeContainer = (row.$parentRow == null) ? tree : row.$parentRow.container;
					var add = false;
					for(var i = 0; i < nodeContainer.childNodes.length; ++i)
					{
						var child = nodeContainer.childNodes[i];
						if(add)
							tree.addToSelection(child);
							
						if(child === firstSelected || child === row)
						{
							if(add)
								break;
							else
							{
								tree.addToSelection(child);
								add = true;
							}
						}
					}
				}
			}
		}
		else if(!event.ctrlKey)
		{
			tree._suppressSelectEvent = true;
				tree.clearSelection();
			tree._suppressSelectEvent = false;
		}
			
		tree.addToSelection(row);
	},
	
	/**
	 * Called when drag start event is initialized on row content
	 * 
	 * @param   {DOMEvent}   event   Row content
	 */
	_onRowContentDragStart: function _onRowContentDragStart(event)
	{
		/** @type element  */
		var row = event.currentTarget.parentNode;
		var tree = row.tree;
		
		var data = {
			data: []
		};
		
		// check if current node is in selection
		if(row.hasAttribute("selected"))
		{
			// copy whole selection
			
			for(var i = 0; i < tree.selection.length; ++i)
				data.data.push(tree.selection[i].data);
			
			event.dataTransfer.mozSetDataAt("application/x-tree-data", data, 0);
			event.dataTransfer.setDragImage(event.currentTarget, 0, 0);
		}
		else
		{
			tree.select(row);
			data.data.push(event.currentTarget.parentNode.data);
			event.dataTransfer.mozSetDataAt("application/x-tree-data", data, 0);
			event.dataTransfer.setDragImage(event.currentTarget, 0, 0);
		}
	}, 
	
	
	
	/**
	 * Adds the given row to the selection
	 * 
	 * @param   {Element}   row
	 */
	addToSelection: function addToSelection(row)
	{
		if(row.hasAttribute("selected"))
			return;
			
		this.selection.push(row);
		
		row.setAttribute("selected", "");
		
		this._fireSelectEvent(null);
	},
	
	/**
	 * Adds the given row to the selection
	 * 
	 * @param   {DOMElement}   row
	 */
	removeFromSelection: function removeFromSelection(row)
	{
		for(var i = 0; i < this.selection.length; ++i)
		{
			if(this.selection[i] === row)
			{
				this.selection.splice(i, 1);
				row.removeAttribute("selected");
				this._fireSelectEvent(null);
				return;
			}
		}
	},
	
	/**
	 * Clears the selection
	 */
	clearSelection: function clearSelection()
	{
		var lengthBefore = this.selection.length;
		
		for(var i = 0; i < this.selection.length; ++i)
			this.selection[i].removeAttribute("selected");
		
		this.selection.length = 0;
		
		if(lengthBefore > 0)
			this._fireSelectEvent(null);
	},
	
	/**
	 * Selects the given row
	 * 
	 * @param   {DOMElement}   row
	 */
	select: function select(row)
	{
		this._suppressSelectEvent = true;
			this.clearSelection();
		this._suppressSelectEvent = false;
		
		this.addToSelection(row);
	},
	
	/**
	 * Fires the select event
	 * 
	 * @param   {Object}   [data]   (optional) Data to be passed to the event
	 */
	_fireSelectEvent: function _fireSelectEvent(data)
	{
		if(!this._suppressSelectEvent)
		{
			var event = this.ownerDocument.createEvent("CustomEvent");
			event.initEvent("select", true, true, data);
			this.dispatchEvent(event);
		}
	}, 
	
	/**
	 * Creates a row for the tree
	 * 
	 * @param   {Element}       $parent       Parent node
	 * @param   {boolean}       isContainer   Does it have a 
	 * @param   {Object}        data          Private data
	 * 
	 * @returns {Element}    newly created element
	 */
	createRow: function createTreeRow($parent, isContainer, data)
	{
		var self = this;
		
		var $row = DOMHelper.createDOMNode(this.ownerDocument, "vbox", {"class": "dom-tree-row"}, {isRow: true, tree: self, data: data});
		//row.classList.add("dom-tree-row");
		//row.isRow = true;
		//row.tree = this;
		//
		//row.data = data;
		
		$row.toggleCollapse = this._rowToggleCollapse;
		
		// content of the row
		var $rowContent = DOMHelper.createDOMNodeOn($row, "hbox", {"class" : "dom-tree-row-content"});
		//rowContent.classList.add("dom-tree-row-content");
		$rowContent.addEventListener("click", this._onRowContentClicked);
		$rowContent.addEventListener("dragstart", this._onRowContentDragStart);
		
		//row.appendChild(rowContent);
		
		// twisty
		var $twisty = DOMHelper.createDOMNodeOn($rowContent, "box", {"class" : "dom-tree-row-twisty"});
		DOMHelper.createDOMNodeOn($twisty, "image");
		//twisty.appendChild(this.document.createElement("image"));
		//twisty.classList.add("dom-tree-row-twisty");
		$twisty.addEventListener("click", this._onToggleCollapse, true);
		//rowContent.appendChild(twisty);
		
		// image
		var $labelImage = DOMHelper.createDOMNodeOn($rowContent, "box", {"class" : "dom-tree-row-label-image"});
		DOMHelper.createDOMNodeOn($labelImage, "image");
		//labelImage.appendChild(this.document.createElement("image"));
		//labelImage.classList.add("dom-tree-row-label-image");
		//rowContent.appendChild(labelImage);
		
		var rowAttr = this.dataCB("attributes", data, $row);
		if(rowAttr)
			DOMHelper.setAttributes($row, rowAttr)
		
		// label
		var $label = DOMHelper.createDOMNodeOn($rowContent, "label", {"class" : "dom-tree-row-label", value: self.dataCB("label", data, $row)});
		//label.classList.add("dom-tree-row-label");
		//label.setAttribute("value", this.dataCB("label", data, row));
		//rowContent.appendChild(label);
		
		if($parent)
		{
			$row.$parentRow = $parent;
			$row.level = $parent.level + 1;
		}
		else
		{
			$row.$parentRow = null;
			$row.level = 0;
		}
		
		this._makeContainer($row, isContainer);
		
		return $row;
	},
	
	/**
	 * Makes a row a container / or removes that
	 * 
	 * @param   {DOMElement}   row           The row
	 * @param   {boolean}      isContainer   
	 */
	_makeContainer: function _makeContainer($row, isContainer)
	{
		if(isContainer)	// TODO: make main-box a container too
		{
			$row.isContainer = true;
			$row.isContainerOpen = false;
			
			var $containerBox = DOMHelper.createDOMNodeOn($row, "vbox", {"class": "dom-tree-container"});
			//containerBox.classList.add("dom-tree-container");
			//$row.appendChild(containerBox);
			$row.container = $containerBox;
			
			$row.setAttribute("isContainer", "true");
		}
		else
		{
			$row.isContainer = false;
			$row.isContainerOpen = false;
		}
	}, 
	
	
	/**
	 * Creates a row for the tree and appends it
	 * 
	 * @param   {DOMElement}    parent        Parent node
	 * @param   {boolean}       isContainer   Does it have a 
	 * @param   {Object}        data          Private data
	 * 
	 * @returns {DOMElement}    newly created element
	 */
	createAndAppendRow: function createAndAppendRow(parent, isContainer, data)
	{
		var row = this.createRow(parent, isContainer, data);
		
		if(!parent)
			this.appendChild(row);
		else
		{
			if(!parent.isContainer)
				this._makeContainer(parent, true);
				
			parent.container.appendChild(row);
		}
			
		return row;
	},
	
	/**
	 * Removes all rows
	 */
	removeAllRows: function removeAllRows()
	{
		this.clearSelection();
		
		while(this.firstChild)
			this.removeChild(this.firstChild);
		
	}, 
	
	
}
