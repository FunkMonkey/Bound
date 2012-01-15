
var EXPORTED_SYMBOLS = ["jSmart"];

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

loader.loadSubScript("chrome://bound/content/modules/smart-2.6.min.js");

jSmart.prototype.registerPlugin(
      'modifier', 
      'str_repeat', 
      function(input, multiplier){return new Array(multiplier+1).join(input);}
);

