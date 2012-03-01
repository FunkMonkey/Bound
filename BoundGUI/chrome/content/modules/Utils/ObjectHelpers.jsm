var EXPORTED_SYMBOLS = ["ArrayHelpers"];

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