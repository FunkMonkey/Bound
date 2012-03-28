var EXPORTED_SYMBOLS = ["DOMTree"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;
Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/DOMHelper.jsm");

/**
 * 
 *
 * @constructor
 * @this {DOMTreeRow}
 */
function DOMTreeRow($this, $tree, $parent, data) // TODO: remove $tree and combine with parent
{
	Extension.borrow($this, DOMTreeRow.prototype);
	
	$this.classList.add("dom-tree-row");
	$this.tree = $tree;
	$this.data = data;
	$this.isRow = true;
	$this.isContainer = false;
	$this.isContainerOpen = false;
	
	//$row.toggleCollapse = this._rowToggleCollapse;
	//$row.invalidate = this._rowInvalidate;
	
	// content of the row
	var $rowContent = DOMHelper.createDOMNodeOn($this, "hbox", {"class" : "dom-tree-row-content"});
	$rowContent.addEventListener("click", $this._onContentClicked.bind($this));
	$rowContent.addEventListener("dragstart", $this._onContentDragStart.bind($this));
	
	// twisty
	var $twisty = DOMHelper.createDOMNodeOn($rowContent, "box", {"class" : "dom-tree-row-twisty"});
	DOMHelper.createDOMNodeOn($twisty, "image");
	$twisty.addEventListener("click", $this.toggleCollapse.bind($this), true);
	
	// image
	var $labelImage = DOMHelper.createDOMNodeOn($rowContent, "box", {"class" : "dom-tree-row-label-image"});
	DOMHelper.createDOMNodeOn($labelImage, "image");
	
	var rowAttr = $tree.dataCB("attributes", data, $this);
	if(rowAttr)
		DOMHelper.setAttributes($this, rowAttr)
	
	// label
	$this.$label = DOMHelper.createDOMNodeOn($rowContent, "label", {"class" : "dom-tree-row-label", value: $tree.dataCB("label", data, $this)});
	
	if($parent)
	{
		$this.$parentRow = $parent;
		$this.level = $parent.level + 1;
	}
	else
	{
		$this.$parentRow = null;
		$this.level = 0;
	}
	
	return $this;
}

DOMTreeRow.prototype = {
	/**
	 * Makes a row a container / or removes that
	 */
	_makeContainer: function _makeContainer()
	{
		if(this.isContainer)
			return;
		
		this.isContainer = true;
		this.isContainerOpen = false;
		
		this.$container = DOMHelper.createDOMNodeOn(this, "vbox", {"class": "dom-tree-container"});
		this.setAttribute("isContainer", "true");
	},
	
	// TODO: _removeContainer
	
	/**
	 * Toggles the collapse of a row
	 */
	toggleCollapse: function toggleCollapse()
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
	_onContentClicked: function _onContentClicked(event)
	{
		//var row = event.currentTarget.parentNode;
		var tree = this.tree;
		
		// TODO: exclude twisty
		// TODO: different keys
		
		if(event.shiftKey)
		{
			if(tree.selection.length === 0)
				tree.addToSelection(this);
			else
			{
				var firstSelected = tree.selection[0];
				tree.clearSelection();
				
				if(firstSelected.$parentRow !== this.$parentRow)
				{
					tree.addToSelection(firstSelected);
					tree.addToSelection(this);
				}
				else
				{
					var nodeContainer = (this.$parentRow == null) ? tree : this.$parentRow.$container;
					var add = false;
					for(var i = 0; i < nodeContainer.childNodes.length; ++i)
					{
						var child = nodeContainer.childNodes[i];
						if(add)
							tree.addToSelection(child);
							
						if(child === firstSelected || child === this)
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
		
		
		if(event.ctrlKey)
		{
			if(this.hasAttribute("selected"))
				tree.removeFromSelection(this);
			else
				tree.addToSelection(this);
		}
		else
			tree.addToSelection(this);
		
	},
	
	/**
	 * Called when drag start event is initialized on row content
	 * 
	 * @param   {DOMEvent}   event   Row content
	 */
	_onContentDragStart: function _onContentDragStart(event)
	{
		/** @type element  */
		//var row = event.currentTarget.parentNode;
		var tree = this.tree;
		
		var data = {
			data: []
		};
		
		// check if current node is in selection
		if(this.hasAttribute("selected"))
		{
			// copy whole selection
			
			for(var i = 0; i < tree.selection.length; ++i)
				data.data.push(tree.selection[i].data);
			
			event.dataTransfer.mozSetDataAt("application/x-tree-data", data, 0);
			event.dataTransfer.setDragImage(event.currentTarget, 0, 0);
		}
		else
		{
			tree.select(this);
			data.data.push(event.currentTarget.parentNode.data);
			event.dataTransfer.mozSetDataAt("application/x-tree-data", data, 0);
			event.dataTransfer.setDragImage(event.currentTarget, 0, 0);
		}
	},
	
	invalidate: function invalidate()
	{
		this.$label.value = this.tree.dataCB("label", this.data, this);
	},
};

DOMTreeRow.create = function($tree, $parent, data)
{
	var $this = DOMHelper.createDOMNode($tree.ownerDocument, "vbox");
	DOMTreeRow($this, $tree, $parent, data);
	return $this;
}

// TODO: create on vbox as this!
// TODO: use DOMHelper
function DOMTree($this, dataCB)
{
	Extension.borrow($this, DOMTree.prototype);
	$this.isDOMTree = true;
	$this.classList.add("dom-tree");
	$this.dataCB = dataCB;
	
	$this.selection = [];
	$this._suppressSelectEvent = false;
	
	$this.addEventListener("click", $this._onClick_.bind($this), true);
}

DOMTree.createOn = function(element, dataCB)
{
	DOMTree(element, dataCB);
	
	return element;
}

DOMTree.prototype =
{
	
	/**
	 * Called when clicked on the tree
	 * 
	 * @param   {DOMEvent}   e   Click event
	 */
	_onClick_: function _onClick_(e)
	{
		if(e.target === this)
			this.clearSelection();
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
	createRow: function createRow($parent, isContainer, data)
	{
		var $row = DOMTreeRow.create(this, $parent, data);
		if(isContainer)
			$row._makeContainer();
			
		return $row;
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
				parent._makeContainer();
				
			parent.$container.appendChild(row);
		}
			
		return row;
	},
	
	/**
	 * Removes the given row from the tree
	 * 
	 * @param   {DOMTreeRow}   $row   Remove
	 */
	removeRow: function removeRow($row)
	{
		if($row.tree !== this)
			return;
		
		if(!$row.$parentRow)
			this.removeChild($row);
		else
			$row.$parentRow.$container.removeChild($row);
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
