
var EXPORTED_SYMBOLS = ["jSmart"];

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

// load the original jSmart file
loader.loadSubScript("chrome://bound/content/modules/Templates/smart-2.6.min.js");

// TODO: can we remove this?
// adding a str_repeat function
jSmart.prototype.registerPlugin(
      'modifier', 
      'str_repeat', 
      function(input, multiplier){return new Array(multiplier+1).join(input);}
);

