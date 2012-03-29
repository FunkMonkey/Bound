var EXPORTED_SYMBOLS = ["ArrayHelpers", "ObjectHelpers"];


/**
 * Provides helper functions for working with arrays
 * @namespace
 *
 * @type Object
 */
var ArrayHelpers = {
	
	/**
	 * Removes duplicates from an array by creating a map
	 * 
	 * @param   {Array}   arr       Array to manipulate
	 * @param   {boolean} inplace   True if array should be manipulated in place
	 * 
	 * @returns {Array}   Result array
	 */
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
	
	/**
	 * Removes duplicates from an array by creating a map
	 * 
	 * @param   {Array}   arr       Array to manipulate
	 * 
	 * @returns {Array}   Result array
	 */
	removeHashableDuplicates: function removeHashableDuplicates(arr)
	{
		return ArrayHelpers._removeHashableDuplicates(arr, false);
	},
	
	/**
	 * Removes duplicates from an array inplace by creating a map
	 * 
	 * @param   {Array}   arr       Array to manipulate
	 * 
	 * @returns {Array}   Result array
	 */
	removeHashableDuplicatesInplace: function removeHashableDuplicatesInplace(arr)
	{
		return ArrayHelpers._removeHashableDuplicates(arr, true);
	}
};

/**
 * Provides helper functions for working with objects
 * @namespace
 *
 * @type Object
 */
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