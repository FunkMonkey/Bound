let EXPORTED_SYMBOLS = ["CustomEventSender"];

function CustomEventSender()
{
};

CustomEventSender.prototype = {
	
	
	/*
	 *
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
	 * @param   {String}     eventName   Event to be searched
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
	
	
	/*
	 *
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