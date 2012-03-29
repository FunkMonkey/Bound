
var EXPORTED_SYMBOLS = ["createLoggerOutputOn"];

Components.utils.import("chrome://bound/content/modules/log.jsm");

Components.utils.import("chrome://bound/content/modules/Utils/Extension.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/DOMHelper.jsm");
Components.utils.import("chrome://bound/content/modules/Utils/Logger.jsm");


/**
 * Represents a LoggerOutput
 * @constructor
 *
 * 
 */
function LoggerOutput()
{
	this.classList.add("logger-output");
	this.listener = this._onEntryAdded.bind(this);
}

LoggerOutput.prototype = {
	
	/**
	 * Called when an entry has been added to the logger
	 * 
	 * @param   {Logger}          logger   Logger the entry has been added to
	 * @param   {LoggerMessage}   entry    Entry that has been added
	 */
	_onEntryAdded: function _onEntryAdded(logger, entry)
	{
		this.addLogMessageEntry(entry);
	}, 
	
	
	/**
	 * Sets the logger for output
	 * 
	 * @param   {Logger}   logger       Logger to set
	 * @param   {Logger}   addEntries   If true, existing entries will be added
	 */
	setLogger: function setLogger(logger, addEntries)
	{
		if(this.logger)
			this.logger.removeListener(this.listener);
		
		this.logger = logger;
		this.logger.addListener(this.listener);
		
		if(addEntries)
		{
			for(var i = 0; i < this.logger.messages.length; ++i)
				this.addLogMessageEntry(this.logger.messages[i]);
		}
	}, 
	
	
	/**
	 * Adds a log message entry
	 * 
	 * @param   {Object}   entry   
	 */
	addLogMessageEntry: function addLogMessageEntry(entry)
	{
		var $row = this.ownerDocument.createElement("label");
		$row.setAttribute("value", "[" + entry.timestamp.toLocaleTimeString() + "] " + entry.message);
		$row.setAttribute("logType", this.getTypeString(entry.type));
		this.appendChild($row);
	}, 
	
	/**
	 * Returns the logger type as a string
	 * 
	 * @param   {number}   loggerType   Logger type
	 * 
	 * @returns {string}   String representation of logger type
	 */
	getTypeString: function getTypeString(loggerType)
	{
		switch(loggerType)
		{
			case Logger.TYPE_INFO:    return "Info";
			case Logger.TYPE_WARNING: return "Warning";
			case Logger.TYPE_ERROR:   return "Error";
		}
		
		return "";
	}, 
};

/**
 * Creates a LoggerOutput on the given element
 * 
 * @param   {element}   element   Element to create LoggerOutput on
 * 
 * @returns {element}   The same element
 */
function createLoggerOutputOn(element)
{
	Extension.borrow(element, LoggerOutput.prototype);
	LoggerOutput.call(element);
	
	return element;
}

LoggerOutput.createOn = createLoggerOutputOn;


