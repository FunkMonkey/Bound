var EXPORTED_SYMBOLS = ["DOMHelper"];

var DOMHelper = {
	
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
	
	createDOMNodeOn: function createDOMNodeOn(parent, nodeName, attributes, members)
	{
		var node = this.createDOMNode(parent.ownerDocument, nodeName, attributes, members);
		parent.appendChild(node);
		
		return node;
	},
	
	createDOMNodeOnAfter: function createDOMNodeOnAfter(parent, nodeName, after, attributes, members)
	{
		var node = this.createDOMNode(parent.ownerDocument, nodeName, attributes, members);
		
		if(!after)
			parent.appendChild(node);
		else
			parent.insertBefore(node, after.nextSibling);
		
		return node;
	},
	
	setAttributes: function setAttributes(node, attributes)
	{
		if(attributes)
		{
			for(attrName in attributes)
				node.setAttribute(attrName, attributes[attrName]);
		}
	},
}

