var EXPORTED_SYMBOLS = ["Logger", "LoggerMessage"];

Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/CustomEvents.jsm");

/**
 * Represents a message for the logger
 * @constructor
 *
 * @property   {number}   type        Type of the message
 * @property   {string}   message     Message content
 * @property   {Date}     timestamp   Timestamp
 */
function LoggerMessage(type, message, timestamp)
{
   this.type = type;
   this.message = message;
   this.timestamp = timestamp;
}

LoggerMessage.prototype = {
   
};

Object.defineProperty(LoggerMessage.prototype, "constructor", {value: LoggerMessage});


/**
 * Represents a logger for storing log messages
 * @constructor
 *
 * @property   {LoggerMessage[]}   messages   List of messages
 */
function Logger()
{
   this.messages = [];
}

Logger.TYPE_INFO = 1;
Logger.TYPE_WARNING = 2;
Logger.TYPE_ERROR = 3;

Logger.prototype = {
   /**
	* Adds an info message
	* 
	* @param   {string}   message      Message to add
	* @param   {Date}     [timestamp]  (Optional) Timestamp for adding, if not set, then present
	*/
   addInfoMessage: function addInfoMessage(message, timestamp)
   {
	  if(!timestamp)
		 timestamp = new Date();
	  
	  var entry = new LoggerMessage(Logger.TYPE_INFO, message, timestamp);
	  this.messages.push(entry);
	  this.fireCustomEvent("entryAdded", [this, entry]);
   },
   
   /**
	* Adds a warning message
	* 
	* @param   {string}   message      Message to add
	* @param   {Date}     [timestamp]  (Optional) Timestamp for adding, if not set, then present
	*/
   addWarningMessage: function addWarningMessage(message, timestamp)
   {
	  if(!timestamp)
		 timestamp = new Date();
	  
	  var entry = new LoggerMessage(Logger.TYPE_WARNING, message, timestamp);
	  this.messages.push(entry);
	  this.fireCustomEvent("entryAdded", [this, entry]);
   }, 
   
   /**
	* Adds an error message
	* 
	* @param   {string}   message      Message to add
	* @param   {Date}     [timestamp]  (Optional) Timestamp for adding, if not set, then present
	*/
   addErrorMessage: function addErrorMessage(message, timestamp)
   {
	  if(!timestamp)
		 timestamp = new Date();
	  
	  entry = new LoggerMessage(Logger.TYPE_ERROR, message, timestamp)
	  this.messages.push(entry);
	  this.fireCustomEvent("entryAdded", [this, entry]);
   },
   
   /**
	* Adds a listener
	* 
	* @param   {Function}   listener   Listener to add
	*/
   addListener: function addListener(listener)
   {
	  this.addCustomEventListener("entryAdded", listener);
   },
   
   /**
	* Removes the given listener
	* 
	* @param   {Function}   listener   Listener to remove
	*/
   removeListener: function removeListener(listener)
   {
	  this.removeCustomEventListener("entryAdded", listener);
   }, 
   
   
};

Object.defineProperty(Logger.prototype, "constructor", {value: Logger});

Extension.borrow(Logger.prototype, CustomEventSender.prototype);