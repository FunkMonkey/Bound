var templateCode = "{if $declareResultVar}int {/if}{$resultVarName} = jsval_to_int_x({$input_jsval}){if $finishStatement};{/if}";

var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/int_x.hpp\""];