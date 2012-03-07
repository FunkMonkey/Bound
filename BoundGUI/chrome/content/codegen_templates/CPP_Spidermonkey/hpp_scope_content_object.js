var tShared = TemplateManager.getTemplate("CPP_Spidermonkey/shared_template_code");

function onFetchBefore(data)
{
	tShared.handleNamespaces(data);
}
