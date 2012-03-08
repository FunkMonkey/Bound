function onFetchBefore(data)
{
	data.includeGuard = 'JSWRAP_';
	var path = data.path.replace(/\//g, "_").toUpperCase();
	data.includeGuard += path + "_HPP";
}
