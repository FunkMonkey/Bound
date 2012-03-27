var tShared = TemplateManager.getTemplate("CPP_Spidermonkey/shared_template_code");

function onFetchBefore(data)
{
	tShared.handleNamespaces(data);
}

function getTypeLibraryInfo(genInput)
{
	var fullNamespace = '::jswrap';
	for(var i = 0; i < genInput.nameChain.length; ++i)
		fullNamespace += '::' + genInput.nameChain[i];
		
	return {
		unwrapFunction:       fullNamespace + "::getFromJSValue",
		wrapInstanceFunction: fullNamespace + "::wrapInstance",
		wrapCopyFunction :    fullNamespace + "::wrapCopy",
		jsClass:              fullNamespace + "::jsClass",
		jsPrototype:          fullNamespace + "::jsPrototype",
		jsConstructor:        fullNamespace + "::jsConstructor"
	}
}