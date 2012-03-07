var tShared = TemplateManager.getTemplate("CPP_Spidermonkey/shared_template_code");

function onFetchBefore(data)
{
	data.newObjectName = data.nameChain[data.nameChain.length-1];
	data.defScope = (data.defineOnParent == true) ? 'scope' : 'newObj';
	tShared.handleNamespaces(data);
	handleFunctions(data);
	tShared.createInitCalls(data);
}

function handleFunctions(data)
{
	data.functionsWrapperCode = ''; 
	data.functionsDefineCode = '';
	for(var i = 0; i < data.children.length; ++i)
	{
		var func = data.children[i];
		if(func.type === 'Function')
		{
			data.functionsWrapperCode += func.wrapperFunction.code;
			if(i != data.children.length - 1)
				data.functionsWrapperCode += '\n\n';
				
			data.functionsDefineCode += 'JS_FS("' + func.name + '", ' + func.wrapperFunction.name + ', ' + func.numParams + ', 0),\n';
		}
	}
}