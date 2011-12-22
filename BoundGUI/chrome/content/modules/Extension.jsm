var EXPORTED_SYMBOLS = ["Extension"];

let Extension =
{
	inherit: function inherit(child, supertype)
	{
		child.prototype.__proto__ = supertype.prototype;
	},
	
	borrow: function borrow(_to, _from)
	{
		for(var prop in _from)
			_to[prop] = _from[prop];
	}
};
