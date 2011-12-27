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
		
		row.data = data;
		
		row.toggleCollapse = this._rowToggleCollapse;
		
		// content of the row
		let rowContent = this.document.createElement("hbox");
		rowContent.classList.add("dom-tree-row-content");
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
			row.level = 0;
		
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
		return row;
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
			parent.container.appendChild(row);
			
		return row;
	}, 
	
	
}
