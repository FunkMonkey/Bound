var EXPORTED_SYMBOLS = ["ArrayHelpers", "ObjectHelpers"];

var ArrayHelpers = {
	
	_removeHashableDuplicates: function _removeHashableDuplicates(arr, inplace)
	{
		var obj={};
		for (var i = 0, len = arr.length; i < len; ++i)
			obj[arr[i]]=0;
		
		var out = null;
		if(inplace)
		{
			out = arr;
			out.length = 0;
		}
		else
			out = [];
		
		for (i in obj)
			out.push(i);

		return out;
	},
	
	removeHashableDuplicates: function removeHashableDuplicates(arr)
	{
		return ArrayHelpers._removeHashableDuplicates(arr, false);
	},
	
	removeHashableDuplicatesInplace: function removeHashableDuplicatesInplace(arr)
	{
		return ArrayHelpers._removeHashableDuplicates(arr, true);
	}
	
	
	
};

var ObjectHelpers = {
	
	/**
	 * Adds the keys from the given array to the object
	 * 
	 * @param   {Object}   obj    Object to merge keys into
	 * @param   {Array}    keys   Keys to merge into
	 */
	mergeKeys: function mergeKeys(obj, keys)
	{
		for(var i = 0, len = keys.length; i < len; ++i)
		{
			obj[keys[i]] = keys[i];
		}
	},
	
};