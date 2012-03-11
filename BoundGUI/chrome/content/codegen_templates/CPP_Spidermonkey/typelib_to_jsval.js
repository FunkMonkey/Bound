var templateCode = "\
{if $declare_jsval}jsval {/if}{$jsvalName} = \
OBJECT_TO_JSVAL({$funcName}(cx, {$inputVarPre}{$inputVar})){if $finishStatement};{/if}";

//var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/int_x.hpp\""];

function getIncludes(data)
{
	return ['#include "' + data.typeLib.includeFile + '"'];
}

function onFetchBefore(data)
{
	data.inputVarPre = "";
	
	data.funcName = "";
	
	var canonicalType = data.astType.getCanonicalType();
	switch(canonicalType.kind)
	{
		case "Pointer":
			data.funcName = data.typeLib.wrapInstanceFunction;
			break;
		case "LValueReference": 
			data.funcName = data.typeLib.wrapInstanceFunction;
			data.inputVarPre = "&";
			break;
		case "Record": 
			data.funcName = data.typeLib.wrapCopyFunction;
			break;
	}		
}