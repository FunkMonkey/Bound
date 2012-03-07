var templateCode = "\
{if $declare_jsval}jsval {$jsvalName};\n\
{/if}double_to_jsval_x(cx, {$inputVar}, &{$jsvalName}){if $finishStatement};{/if}";

var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/float_x.hpp\""];