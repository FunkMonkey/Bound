var templateCode = "\
{if $declareResultVar}{$typeStringCanonical}{$declarePost} {/if}{$resultVarName} = \
{$funcPre}{$typeLib.unwrapFunction}(cx, {$input_jsval}){if $finishStatement};{/if}";

function getIncludes(data)
{
	return ['#include "' + data.typeLib.includeFile + '"'];
}

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
