/*
 * This define is for Windows only, it is a work-around for bug 661663.
 */
//#ifdef _MSC_VER
//# define XP_WIN
//#endif

#include <iostream>
#include <typeinfo>
#include "jsapi.h"
#include "SimpleClass_wrap.hpp"
#include "UsingSimpleClass_wrap.hpp"
#include "Functions_BasicTypes_wrap.hpp"
//#include "wrap_Test.hpp"
#include "Functions_Strings_wrap.hpp"
#include "GlobalFunctions.hpp"

#include <fstream>

/* The class of the global object. */
static JSClass global_class = {
    "global", JSCLASS_GLOBAL_FLAGS,
    JS_PropertyStub, JS_PropertyStub, JS_PropertyStub, JS_StrictPropertyStub,
    JS_EnumerateStub, JS_ResolveStub, JS_ConvertStub, JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

/* The error reporter callback. */
void reportError(JSContext *cx, const char *message, JSErrorReport *report)
{
    fprintf(stderr, "%s:%u:%s\n",
            report->filename ? report->filename : "<no filename>",
            (unsigned int) report->lineno,
            message);
}

std::string loadStringFromFile(const std::string& filename)
{
	std::ifstream inputStream(filename.c_str(), std::ifstream::in);

	if(!inputStream)
	{
		std::cout << "File " << filename.c_str() << " does not exist" << std::endl;
		return "";
	}

	std::string result;

	inputStream.seekg(0, std::ios::end);   
	result.reserve(inputStream.tellg());
	inputStream.seekg(0, std::ios::beg);

	result.assign((std::istreambuf_iterator<char>(inputStream)), std::istreambuf_iterator<char>());

	inputStream.close();

	return result;
}


int main(int argc, const char *argv[])
{
	//testTypeID();

    /* JS variables. */
    JSRuntime *rt;
    JSContext *cx;
    JSObject  *global;

    /* Create a JS runtime. */
    rt = JS_NewRuntime(8L * 1024L * 1024L);
    if (rt == NULL)
        return 1;

    /* Create a context. */
    cx = JS_NewContext(rt, 8192);
    if (cx == NULL)
        return 1;
    JS_SetOptions(cx, JSOPTION_VAROBJFIX | JSOPTION_JIT | JSOPTION_METHODJIT);
    JS_SetVersion(cx, JSVERSION_LATEST);
    JS_SetErrorReporter(cx, reportError);
	JS_BeginRequest(cx); 

    /* Create the global object in a new compartment. */
    global = JS_NewCompartmentAndGlobalObject(cx, &global_class, NULL);
    if (global == NULL)
        return 1;

    /* Populate the global object with the standard globals,
       like Object and Array. */
    if (!JS_InitStandardClasses(cx, global))
        return 1;

    /* -----------------------------------------------------------
		Your application code here. This may include JSAPI calls
       to create your own custom JS objects and run scripts. */

	jswrap::GlobalFunctions::init(cx, global);
	jswrap::SimpleClass::init(cx, global);
	
	//jswrap::Functions_BasicTypes::init(cx, global);
	//jswrap::wrap_Test::init(cx, global);
	jswrap::Functions_Strings::init(cx, global);
	jswrap::SimpleClass::init(cx, global);
	jswrap::UsingSimpleClass::init(cx, global);

	jsval rval;
	JSBool ok;

	std::string src = "";
	if(argc > 1)
		src = loadStringFromFile(argv[1]);

	ok = JS_EvaluateScript(cx, global, src.c_str(), src.length(), "foo", 0, &rval);

	int i;
	std::cin >> i;

	// -----------------------------------------------------------
    /* Cleanup. */
	JS_EndRequest(cx); 
    JS_DestroyContext(cx);
    JS_DestroyRuntime(rt);
    JS_ShutDown();

	

    return 0;
}