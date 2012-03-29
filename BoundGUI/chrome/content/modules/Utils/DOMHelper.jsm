var EXPORTED_SYMBOLS = ["DOMHelper"];

/**
 * Provides helper functions for handling DOM
 * @namespace
 * 
 * @type Object
 */
var DOMHelper = {
	
	/**
	 * Creates a DOM node
	 * 
	 * @param   {DOMDocument}     document      Document to create node with
	 * @param   {string}          nodeName      Type of the node
	 * @param   {Object<String>}  [attributes]  Attributes to add
	 * @param   {Object<Object>}  [members]     Members to add
	 * 
	 * @returns {DOMElement} The created element
	 */
	createDOMNode: function createDOMNode(document, nodeName, attributes, members)
	{
		var node = document.createElement(nodeName);
		if(attributes)
		{
			for(var attrName in attributes)
				node.setAttribute(attrName, attributes[attrName]);
		}
		
		if(members)
		{
			for(var memberName in members)
				node[memberName] = members[memberName];
		}
		
		return node;
	},
	
	/**
	 * Creates a DOM node and appends it to the given element
	 * 
	 * @param   {DOMElement}      parent        Element to append to
	 * @param   {string}          nodeName      Type of the node
	 * @param   {Object<String>}  [attributes]  Attributes to add
	 * @param   {Object<Object>}  [members]     Members to add
	 * 
	 * @returns {DOMElement} The created element
	 */
	createDOMNodeOn: function createDOMNodeOn(parent, nodeName, attributes, members)
	{
		var node = this.createDOMNode(parent.ownerDocument, nodeName, attributes, members);
		parent.appendChild(node);
		
		// TODO: members may be overridden when appending child (in case bindings are attached)
		
		return node;
	},
	
	/**
	 * Creates a DOM node and appends it to the given element after another given element
	 * 
	 * @param   {DOMElement}      parent        Element to append to
	 * @param   {string}          nodeName      Type of the node
	 * @param   {DOMElement}      after         Element to append after; if null, then simply appended
	 * @param   {Object<String>}  [attributes]  Attributes to add
	 * @param   {Object<Object>}  [members]     Members to add
	 * 
	 * @returns {DOMElement} The created element
	 */
	createDOMNodeOnAfter: function createDOMNodeOnAfter(parent, nodeName, after, attributes, members)
	{
		var node = this.createDOMNode(parent.ownerDocument, nodeName, attributes, members);
		
		if(!after)
			parent.appendChild(node);
		else
			parent.insertBefore(node, after.nextSibling);
		
		return node;
	},
	
	/**
	 * Adds attributes on the given DOM element
	 * 
	 * @param   {DOMElement}      node        Element to set attributes on
	 * @param   {Object<String>}  attributes  Attributes to add
	 */
	setAttributes: function setAttributes(node, attributes)
	{
		if(attributes)
		{
			for(attrName in attributes)
				node.setAttribute(attrName, attributes[attrName]);
		}
	},
}

