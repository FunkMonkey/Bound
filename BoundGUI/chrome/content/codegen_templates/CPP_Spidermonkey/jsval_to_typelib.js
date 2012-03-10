var templateCode = "\
{if $declareResultVar}{$typeStringCanonical}{$declarePost} {/if}{$resultVarName} = \
{$funcPre}{$typeLib.unwrapFunction}(cx, {$input_jsval}){if $finishStatement};{/if}";


//var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/int_x.hpp\""];

function onFetchBefore(data)
{
	data.declarePost = "";
	data.funcPre = "";
	
	var canonicalType = data.astType.getCanonicalType();
	switch(canonicalType.kind)
	{
		case "Pointer": break;
		case "LValueReference": 
			data.funcPre = "*";
			break;
		case "Record": 
			data.declarePost = "&";
			data.funcPre = "*";
			break;
	}		
}
