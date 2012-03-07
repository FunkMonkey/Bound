var templateCode = "\
{if $declare_jsval}jsval {$jsvalName};\n\
{/if}int_to_jsval_x(cx, {$inputVar}, &{$jsvalName}){if $finishStatement};{/if}";

var includes = ["#include \"{$cpp_spidermonkey_lib_include_dir}wrap_helpers/int_x.hpp\""];