var templateCode = "\
{if $declare_jsval}jsval {$jsvalName};\n\
{/if}stdString_to_jsval_x(cx, {$inputVarPre}{$inputVar}, &{$jsvalName}){if $finishStatement};{/if}";

var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/std_string_x.hpp\""];

function onFetchBefore(data)
{
	data.inputVarPre = "";
	
	var canonicalType = data.astType.getCanonicalType();
	switch(canonicalType.kind)
	{
		case "Pointer":
			data.inputVarPre = "*";
			break;
	}		
}