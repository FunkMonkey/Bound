let EXPORTED_SYMBOLS = ["DOMHelper"];

var DOMHelper = {
	createDOMNodeOn: function createDOMNodeOn(parent, nodeName, attributes, members)
	{
		var node = parent.ownerDocument.createElement(nodeName);
		
		if(attributes)
		{
			for(attrName in attributes)
				node.setAttribute(attrName, attributes[attrName]);
		}
		
		parent.appendChild(node);
		
		if(members)
		{
			for(memberName in members)
				node[memberName] = members[memberName];
		}
		
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

