
var templateCode = "{if $declareResultVar}bool {/if}{$resultVarName} = jsval_to_boolean_x(cx, {$input_jsval}){if $finishStatement};{/if}";

var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/boolean_x.hpp\""];