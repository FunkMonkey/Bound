var templateCode = "{if $declareResultVar}double {/if}{$resultVarName} = jsval_to_double_x(cx, {$input_jsval}){if $finishStatement};{/if}";
var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/float_x.hpp\""];
