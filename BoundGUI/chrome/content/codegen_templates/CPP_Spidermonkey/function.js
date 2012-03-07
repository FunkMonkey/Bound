var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/wrap_helpers_x.hpp\""];


function onFetchBefore(data)
{
	data.paramsInit = '';
	data.callParamList = '';
	for(var i = 0, end = data.params.length; i != end; ++i)
	{
		data.paramsInit += data.params[i].initCode + '\n';
		data.callParamList += data.params[i].name;
	
		if(i != (end-1))
			data.callParamList += ', ';
	}
}

function getParameter(index){return 'args[' + index + ']';}
function getReturnJSVAL(){return 'JS_RVAL(cx, vp)';}
function getCPPReturnValue(){return 'cpp__result';}