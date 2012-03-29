var EXPORTED_SYMBOLS = ["ForwardProxyHandler"];

/**
 * Creates a proxy handler that simply forwards all traps to the given object
 * @constructor
 *
 * @property  {Object}   obj    Wrapped object
 */
function ForwardProxyHandler(obj)
{
	this.obj = obj;
}

ForwardProxyHandler.prototype = {
	constructor: ForwardProxyHandler,
	
	
    getOwnPropertyDescriptor: function(name) {  
      var desc = Object.getOwnPropertyDescriptor(this.obj, name);  
      // a trapping proxy's properties must always be configurable  
      if (desc !== undefined) { desc.configurable = true; }  
      return desc;  
    },  
    getPropertyDescriptor:  function(name) {  
      var desc = Object.getPropertyDescriptor(this.obj, name); // not in ES5  
      // a trapping proxy's properties must always be configurable  
      if (desc !== undefined) { desc.configurable = true; }  
      return desc;  
    },  
    getOwnPropertyNames: function() {  
      return Object.getOwnPropertyNames(this.obj);  
    },  
    getPropertyNames: function() {  
      return Object.getPropertyNames(this.obj);                // not in ES5  
    },  
    defineProperty: function(name, desc) {  
      Object.defineProperty(this.obj, name, desc);  
    },  
    delete:       function(name) { return delete this.obj[name]; },     
    fix:          function() {  
      if (Object.isFrozen(this.obj)) {  
        return Object.getOwnPropertyNames(this.obj).map(function(name) {  
          return Object.getOwnPropertyDescriptor(this.obj, name);  
        });  
      }  
      // As long as this.obj is not frozen, the proxy won't allow itself to be fixed  
      return undefined; // will cause a TypeError to be thrown  
    },  
     
    // ---- derived traps ----
    has:          function(name) { return name in this.obj; },  
    hasOwn:       function(name) { return Object.prototype.hasOwnProperty.call(this.obj, name); },  
    get:          function(receiver, name) { return this.obj[name]; },  
    set:          function(receiver, name, val) { this.obj[name] = val; return true; }, // bad behavior when set fails in non-strict mode  
    enumerate:    function() {  
      var result = [];  
      for (name in this.obj) { result.push(name); };  
      return result;  
    },
	
    keys: function() { return Object.keys(this.obj) }  
	
};
