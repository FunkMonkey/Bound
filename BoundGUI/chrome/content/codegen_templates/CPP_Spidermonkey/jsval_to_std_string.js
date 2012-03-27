var templateCode = "{if $declareResultVar}std::string{$declarePost} {/if}{$resultVarName} = {$funcPre}jsval_to_stdString_x(cx, {$input_jsval}){if $finishStatement};{/if}";
var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/std_string_x.hpp\""];

function onFetchBefore(data)
{
	data.declarePost = "";
	data.funcPre = "";
	
	var canonicalType = data.astType.getCanonicalType();
	switch(canonicalType.kind)
	{
		case "Pointer": 
			data.declarePost = "*";
			data.funcPre = "&";
			break;
		case "LValueReference": 
			data.declarePost = "&";

			break;
		case "Record": 
			break;
	}		
}
