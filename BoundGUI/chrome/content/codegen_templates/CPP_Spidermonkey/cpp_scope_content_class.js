
var tShared = TemplateManager.getTemplate("CPP_Spidermonkey/shared_template_code");

function onFetchBefore(data)
{
	data.newObjectName = data.nameChain[data.nameChain.length-1];
	tShared.handleNamespaces(data);
	handleFunctions(data);
	tShared.createInitCalls(data);
}

function handleFunctions(data)
{
	data.functionsWrapperCode = ''; 
	data.instanceFunctionsDefineCode = '';
	data.staticFunctionsDefineCode = '';
	for(var i = 0; i < data.children.length; ++i)
	{
		var func = data.children[i];
		if(func.type === 'Function')
		{
			data.functionsWrapperCode += func.wrapperFunction.code;
			if(i != data.children.length - 1)
				data.functionsWrapperCode += '\n\n';
		
			var code = 'JS_FS("' + func.name + '", ' + func.wrapperFunction.name + ', ' + func.numParams + ', 0),\n';
			
			if(func.isStatic == true)
				data.staticFunctionsDefineCode += code;
			else
				data.instanceFunctionsDefineCode += code;
		}
	}
}