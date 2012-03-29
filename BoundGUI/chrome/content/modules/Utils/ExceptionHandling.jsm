var EXPORTED_SYMBOLS = ["createExceptionClass", "wrapWithTryAndCatch"];

// TODO: rename to exception handling

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");

/**
 * Creates a custom exception class that can be used to raise exceptions
 * 
 * @param   {string}   name      Name of the class
 * @param   {string}   message   Message
 *
 * @returns {Error}   New exception class inherited from Error
 */
function createExceptionClass(name, message)
{
	/**
	* A Custom Exception
	*
	* @constructor
	* @this {CustomException}
	*/
   function CustomException(msgAppend)
   {
		if(msgAppend)
			this.message = this.message + msgAppend;
   }
   
   CustomException.prototype = {
	   constructor: CustomException,
	   
	   name: name,
	   message: message
   };
   
   Extension.inherit(CustomException, Error);
   
   return CustomException;
}

/**
 * Wraps the given function in a try and catch block that calls
 * the error callback upon an exception
 *
 * Useful for handling https://bugzilla.mozilla.org/show_bug.cgi?id=503244
 *
 * The error callback takes the following parameters
 *     Error:    Error object caught
 *     Function: function that was wrapped
 *     Object:   This object through which function was called
 *     Array:    Arguments that were passed
 *
 *     Return value: True if error was handled, false if it should be rethrown
 * 
 * @param   {Function}   funcToWrap      Function to wrap
 * @param   {Function}   errorCallback   Error callback to call
 *
 * @returns  {Function}   Wrapper function
 */
function wrapWithTryAndCatch(funcToWrap, errorCallback)
{
	return (function(){
			try
			{
				return funcToWrap.apply(this, arguments);
			}
			catch(e)
			{
				if(!errorCallback(e, funcToWrap, this, arguments))
				   throw e;
				else
					return undefined;
			}
		});
}

