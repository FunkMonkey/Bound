var EXPORTED_SYMBOLS = ["DOMTree"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;
Cu.import("chrome://bound/content/modules/log.jsm");

function TreeRow()
{	
	this.id = 0;
	this.isVisible = false;
	this.isContainer = false;
	this.isContainerEmpty = true;
	this.isContainerOpen = false;
	this.level = 0;
}

function DOMTree(document, vbox, dataCB)
{
	this.document = document;
	this.box = vbox;
	this.box.isDOMTree = true;
	
	this.box.classList.add("dom-tree");
	
	this.dataCB = dataCB;
	
	this.selection = [];
}

DOMTree.prototype =
{
	constructor: DOMTree,
	
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
	 * @param   {DOMEvent}   event   Description
	 */
	_onRowContentClicked: function _onRowContentClicked(event)
	{
		let row = event.currentTarget.parentNode;
		
		// TODO: exclude twisty
		// TODO: different keys
		
		row.tree.clearSelection();
		
		//if(row.hasAttribute("selected"))
		//	row.tree.removeFromSelection(row);
		//else
			row.tree.addToSelection(row);
	}, 
	
	
	/**
	 * Adds the given row to the selection
	 * 
	 * @param   {DOMElement}   row
	 */
	addToSelection: function addToSelection(row)
	{
		for(let i = 0; i < this.selection.length; ++i)
			if(this.selection[i] === row)
				return;
			
		this.selection.push(row);
		
		row.setAttribute("selected", "");
	},
	
	/**
	 * Adds the given row to the selection
	 * 
	 * @param   {DOMElement}   row
	 */
	removeFromSelection: function removeFromSelection(row)
	{
		for(let i = 0; i < this.selection.length; ++i)
		{
			if(this.selection[i] === row)
			{
				this.selection.splice(i, 1);
				row.removeAttribute("selected");
				return;
			}
		}
	},
	
	/**
	 * Clears the selection
	 */
	clearSelection: function clearSelection()
	{
		for(let i = 0; i < this.selection.length; ++i)
			this.selection[i].removeAttribute("selected");
		
		this.selection.length = 0;
	},
	
	/**
	 * Selects the given row
	 * 
	 * @param   {DOMElement}   row
	 */
	select: function select(row)
	{
		this.clearSelection();
		this.addToSelection(row);
	}, 
	
	
	
	
	
	/**
	 * Creates a row for the tree
	 * 
	 * @param   {DOMElement}    parent        Parent node
	 * @param   {boolean}       isContainer   Does it have a 
	 * @param   {Object}        data          Private data
	 * 
	 * @returns {DOMElement}    newly created element
	 */
	createRow: function createTreeRow(parent, isContainer, data)
	{
		let row = this.document.createElement("vbox");
		row.classList.add("dom-tree-row");
		row.tree = this;
		
		row.data = data;
		
		row.toggleCollapse = this._rowToggleCollapse;
		
		// content of the row
		let rowContent = this.document.createElement("hbox");
		rowContent.classList.add("dom-tree-row-content");
		rowContent.addEventListener("click", this._onRowContentClicked);
		row.appendChild(rowContent);
		
		// twisty
		let twisty = this.document.createElement("box");
		twisty.appendChild(this.document.createElement("image"));
		twisty.classList.add("dom-tree-row-twisty");
		twisty.addEventListener("click", this._onToggleCollapse, true);
		rowContent.appendChild(twisty);
		
		// image
		let labelImage = this.document.createElement("box");
		labelImage.appendChild(this.document.createElement("image"));
		labelImage.classList.add("dom-tree-row-label-image");
		rowContent.appendChild(labelImage);
		var rowAttr = this.dataCB("attributes", data, row);
		
		if(rowAttr)		
			for(let attr in rowAttr)
				row.setAttribute(attr, rowAttr[attr]);
		
		// label
		let label = this.document.createElement("label");
		label.classList.add("dom-tree-row-label");
		label.setAttribute("value", this.dataCB("label", data, row));
		rowContent.appendChild(label);
		
		if(parent)
		{
			row.parentRow = parent;
			row.level = parent.level + 1;
		}
		else
		{
			row.parentRow = null;
			row.level = 0;
		}
		
		this._makeContainer(row, isContainer);
		
		return row;
	},
	
	/**
	 * Makes a row a container / or removes that
	 * 
	 * @param   {DOMElement}   row           The row
	 * @param   {boolean}      isContainer   
	 */
	_makeContainer: function _makeContainer(row, isContainer)
	{
		if(isContainer)
		{
			row.isContainer = true;
			row.isContainerOpen = false;
			
			let containerBox = this.document.createElement("vbox");
			containerBox.classList.add("dom-tree-container");
			row.appendChild(containerBox);
			row.container = containerBox;
			
			row.setAttribute("isContainer", "true");
		}
		else
		{
			row.isContainer = false;
			row.isContainerOpen = false;
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
		let row = this.createRow(parent, isContainer, data);
		
		if(!parent)
			this.box.appendChild(row);
		else
		{
			if(!parent.isContainer)
				this._makeContainer(parent, true);
				
			parent.container.appendChild(row);
		}
			
		return row;
	},
	
}
