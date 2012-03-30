


print("INFO: Running various test cases")
print("INFO: If a test case fails, then an error message is printed. Otherwise the test succeeded.")
print("INFO: If an exception is shown, there was an error somewhere")

//---------------------------------------------------
// Builtin
//---------------------------------------------------
print("\nINFO: Testing builtin types")
if(checkPropertyOn("Builtin", this, "Global Object"))
{
	testFunctionsOn(Builtin, { 
			"void_param0": {},
			"void_param1_bool": {param1: true, param1Expected: "true"},
			"void_param1_char": {param1: 10, param1Expected: "10"},
			"void_param1_signed_char": {param1: 10, param1Expected: "10"},
			"void_param1_unsigned_char": {param1: 10, param1Expected: "10"},
			"void_param1_short": {param1: 10, param1Expected: "10"},
			"void_param1_unsigned_short": {param1: 10, param1Expected: "10"},
			"void_param1_int": {param1: 10, param1Expected: "10"},
			"void_param1_unsigned_int": {param1: 10, param1Expected: "10"},
			"void_param1_long": {param1: 10, param1Expected: "10"},
			"void_param1_unsigned_long": {param1: 10, param1Expected: "10"},
			"void_param1_float": {param1: 10.5, param1Expected: "10.5"},
			"void_param1_double": {param1: 10.5, param1Expected: "10.5"},
			"void_param1_long_double": {param1: 10.5, param1Expected: "10.5"},
			"void_param1_wchar_t": {param1: 10, param1Expected: "10"},
			
			"bool_param0": {resultExpected: true},
			"char_param0": {resultExpected: 8},
			"signed_char_param0": {resultExpected: 8},
			"unsigned_char_param0": {resultExpected: 8},
			"short_param0": {resultExpected: 8},
			"unsigned_short_param0": {resultExpected: 8},
			"int_param0": {resultExpected: 8},
			"unsigned_int_param0": {resultExpected: 8},
			"long_param0": {resultExpected: 8},
			"unsigned_long_param0": {resultExpected: 8},
			"float_param0": {resultExpected: 8.5},
			"double_param0": {resultExpected: 8.5},
			"long_double_param0": {resultExpected: 8.5},
			"wchar_t_param0": {resultExpected: 8},
			
			"void_param1_int_float": {param1: 10, param1Expected: "10", param2: 10.5, param2Expected: "10.5"},
			"int_param1_int": {resultExpected: 8, param1: 10, param1Expected: "10"},
			"int_param1_int_float": {resultExpected: 8,param1: 10, param1Expected: "10", param2: 10.5, param2Expected: "10.5"}
		});
}

//---------------------------------------------------
// Strings
//---------------------------------------------------
print("\nINFO: Testing Strings")
if(checkPropertyOn("Strings", this, "Global Object"))
{
	testFunctionsOn(Strings, { 
			"void_param0_constCharPtr": {param1: "StringParam", param1Expected: "StringParam"},
			"void_param0_stdString": {param1: "StringParam", param1Expected: "StringParam"},
			"void_param0_constStdStringRef": {param1: "StringParam", param1Expected: "StringParam"},
			"void_param0_charPtr": {param1: "StringParam", param1Expected: "StringParam"},
			"void_param0_stdStringRef": {param1: "StringParam", param1Expected: "StringParam"},

			"constCharPtr_param0": {resultExpected: "ReturnString"},
			"stdString_param0": {resultExpected: "ReturnString"},
			"constStdStringRef_param0": {resultExpected: "ReturnString"},
			"constStdStringPtr_param0": {resultExpected: "ReturnString"},
			"stdStringRef_param0": {resultExpected: "ReturnString"},
			"stdStringPtr_param0": {resultExpected: "ReturnString"},

		});
}

//---------------------------------------------------
// A simple class with members
//---------------------------------------------------
print("\nINFO: Testing SampleClass")
if(checkPropertyOn("Classes", this, "Global Object"))
{
	if(checkPropertyOn("SampleClass", Classes, "Classes"))
	{
		print("-- Testing static functions")
		testFunctionsOn(Classes.SampleClass, { "staticMemberFunc": {}});
	
		print("-- Testing instance")
		var instance = new Classes.SampleClass();
		if(!instance)
			print("ERROR: could not create instance of 'SampleClass'");
		else
		{
			testFunctionsOn(instance, { "memberFunc": { resultExpected: 8, param1: 8.5, param1Expected: "8.5" }});
			
			print("--- Testing calling member function with wrong execution context (exception expected)")
			try {
				instance.memberFunc.call({}, 8.5);
				print("---- ERROR: no exception thrown")
			} catch(e){
			}
		}
			
		
	}
}

//---------------------------------------------------
// ===== Helper functions for testing =====
//---------------------------------------------------
function testFunctionsOn(object, funcs)
{
	if(!object)
	{
		print("ERROR: Object'" + objectName + "' not existing");
		return false;
	}
	
	var fail = false;
	for(var funcName in funcs)
	{
		print("--- Testing " + funcName)
		if(funcName in object)
		{
			var result = object[funcName](funcs[funcName].param1, funcs[funcName].param2);
			verifyFunctionCall(funcName, result, funcs[funcName].resultExpected, funcs[funcName].param1Expected, funcs[funcName].param2Expected);
		}
		else
		{
			fail = true;
			print("---- ERROR: Function '" + funcName + "' is not defined on the given object");
		}
	}
	
	return fail;
}

function checkPropertyOn(propName, object, objectName)
{
	if(!object)
	{
		print("ERROR: Object'" + objectName + "' not existing");
		return false;
	}
	
	if(propName in object)
		return true;
	
	print("ERROR: '" + propName + "' not defined on '" + objectName + "'");
	return false;
}

function verifyFunctionCall(funcName, returnVal, returnValExpected, param1, param2, instance)
{
	if(getLastFunction() !== funcName)
		print("ERROR: function not called");
	
	if(typeof param1 !== "undefined" && getLastParam1() !== param1)
		print("ERROR: function converted parameter 1 wrong");
		
	if(typeof param2 !== "undefined" && getLastParam2() !== param2)
		print("ERROR: function converted parameter 2 wrong");
	
	if(typeof returnValExpected !== "undefined" && returnVal !== returnValExpected)
		print("ERROR: function returned wrong value");
}