let EXPORTED_SYMBOLS = ["CustomEventSender"];

/**
 * Represents a CustomEventSender
 * @constructor
 *
 * @property   {Object<Function[]>}   _customEvents   List of event listeners per event
 * 
 */
function CustomEventSender()
{
};

CustomEventSender.prototype = {
	
	/**
	 * Adds the given event listener
	 * 
	 * @param   {string}     eventName   Event to be searched
	 * @param   {Function}   listener    Listener to be added
	 */
	addCustomEventListener: function addCustomEventListener(eventName, listener)
	{
		if(!this._customEvents)
			this._customEvents = {};
		
		if(!this._customEvents[eventName])
			this._customEvents[eventName] = [];
		
		this._customEvents[eventName].push(listener);
	},
	
	/**
	 * Removes the given event listener
	 * 
	 * @param   {string}     eventName   Event to be searched
	 * @param   {Function}   listener    Listener to be removed
	 */
	removeCustomEventListener: function removeCustomEventListener(eventName, listener)
	{
		if(!this._customEvents)
			return;
		
		var currListeners = this._customEvents[eventName];
		if(!currListeners)
			return;
		
		for(var i = 0, len = currListeners.length; i < len; ++i)
		{
			if(currListeners[i] === listener)
			{
				currListeners.splice(i, 1);
				break;
			}
		}
	}, 
	
	/**
	 * Fires the event with the given name
	 * 
	 * @param   {string}  eventName   Event to be searched
	 * @param   {Array}   args        Arguments passed to the listeners
	 */
	fireCustomEvent: function fireCustomEvent(eventName, args)
	{
		if(!this._customEvents)
			return;
		
		var currListeners = this._customEvents[eventName];
		
		if(currListeners)
		{
			for(var i = 0; i < currListeners.length; ++i)
				currListeners[i].apply(null, args);
		}
	},
};