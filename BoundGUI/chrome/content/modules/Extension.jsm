var EXPORTED_SYMBOLS = ["Extension"];

var Extension =
{
	inherit: function inherit(child, supertype)
	{
		child.prototype.__proto__ = supertype.prototype;
	},
	
	borrow: function borrow(to, from, options)
	{
		if(!options)
			options = Extension.borrow.stdOptions;
		
		var chain = [];
		
		if(options.ownPropsOnly)
		{
			chain.push(from);
		}
		else
		{
			// creating the inheritence chain
			var currObj = from;
			while(currObj)
			{
				chain.push(currObj);
				
				// go down further in the inheritence chain
				// don't copy Object.prototype
				var proto = Object.getPrototypeOf(currObj);
				
				// dirty hack, cannot check for Object.prototype sometimes (f. ex. in different js contexts)
				// thus checking for a member
				currObj = proto.hasOwnProperty("hasOwnProperty") ? null : proto; 
			}
		}
		
		var borrowedProps = {};
		
		// go through the inheritence chain
		for(var i = 0; i < chain.length; ++i)
		{
			var propNames = Object.getOwnPropertyNames(chain[i]);
			
			// copy all property descriptors over to "to"
			for(var j = 0; j < propNames.length; ++j)
			{
				// don't copy, if prop has already been borrowed from up in the chain
				if(borrowedProps[propNames[j]])
					continue;
				
				// don't overwrite existing properties
				if(!options.overwriteExisting && (propNames[j] in to))
					continue;
				
				// copy the property
				var prop = Object.getOwnPropertyDescriptor(chain[i], propNames[j]);
				
				// TODO: filter for different types of properties
				if(options.usePropFilters)
				{
					if( (!prop.writable && !options.borrowNonWritable) ||
					    (!prop.configurable && !options.borrowNonConfigurable) ||
						(!prop.enumerable && !options.borrowNonEnumerable))
						continue;
					
					// is an accessor
					if(prop.get || prop.set)
					{
						if(!options.borrowAccessors)
							continue;
					}
					else if(typeof(prop.value) === "function")
					{
						if(!options.borrowFunctions)
							continue;
					}
					else
					{
						if(!options.borrowNonFunctionValues)
							continue;
					}
				}
				
				Object.defineProperty(to, propNames[j], prop);
				borrowedProps[propNames[j]] = true;
			}
		}
	}
};

Extension.borrow.stdOptions = {
	ownPropsOnly: false,
	overwriteExisting: false,
	
	// filters
	usePropFilters: false,
	
	borrowAccessors: true,
	borrowFunctions: true,
	borrowNonFunctionValues: true,
	borrowNonEnumerable: true,
	borrowNonConfigurable: true,
	borrowNonWritable: true,
}
