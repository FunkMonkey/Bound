function handleNamespaces(data)
{	
	data.fullNamespace = '::jswrap';
	data.namespacesStart = 'namespace jswrap { ';
	data.namespacesEnd = '} ';
	for(var i = 0; i < data.nameChain.length; ++i)
	{
		data.fullNamespace += '::' + data.nameChain[i];
		data.namespacesStart += 'namespace ' + data.nameChain[i] + ' { ';
		data.namespacesEnd += '} ';
	}
}
		
function createInitCalls(data)
{	
	data.initCalls = '';
	for(var i = 0; i < data.children.length; ++i)
	{
		var child = data.children[i];
		if(child.type === 'Object' || child.type === 'Class')
			data.initCalls += data.fullNamespace + '::' + child.wrapper.name + '::init(cx, ' + data.defScope + ');\n';
	}
}
