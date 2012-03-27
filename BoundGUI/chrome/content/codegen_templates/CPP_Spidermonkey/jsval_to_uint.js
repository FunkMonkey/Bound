var templateCode = "{if $declareResultVar}unsigned {/if}{$resultVarName} = jsval_to_uint32_x(cx, {$input_jsval}){if $finishStatement};{/if}";

var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/int_x.hpp\""];
