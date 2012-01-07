/*
 * This define is for Windows only, it is a work-around for bug 661663.
 */
//#ifdef _MSC_VER
//# define XP_WIN
//#endif

#include <iostream>
#include "jsapi.h"
#include "../wrap/SimpleClass_wrap.hpp"
#include "../wrap/Functions_BasicTypes_wrap.hpp"

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

int main(int argc, const char *argv[])
{
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

	jswrap::SimpleClass::initClass(cx, global);
	jswrap::Functions_BasicTypes::init(cx, global);

	jsval rval;
	JSBool ok;
	//char *source = "var test = new SimpleClass(); test.voidFunc0();";
	char *source = "var x = void_param1_int_float(3.34, 3)";

	ok = JS_EvaluateScript(cx, global, source, strlen(source),
                       "foo", 4, &rval);

	int i;
	std::cin >> i;

	// -----------------------------------------------------------
    /* Cleanup. */
    JS_DestroyContext(cx);
    JS_DestroyRuntime(rt);
    JS_ShutDown();

	

    return 0;
}