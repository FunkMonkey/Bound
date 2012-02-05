var EXPORTED_SYMBOLS = ["createExceptionClass"];


Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");

/**
 * Creates a custom exception class that can be used to raise exceptions
 * 
 * @param   {String}   name      Name of the class
 * @param   {String}   message   Message
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
