var templateCode = "{if $declareResultVar}char* {/if}{$resultVarName} = jsval_to_char_array_x(cx, {$input_jsval}){if $finishStatement};{/if} /* TODO: clean up */";
var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/char_string_x.hpp\""];
