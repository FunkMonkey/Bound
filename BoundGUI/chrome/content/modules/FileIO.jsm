var EXPORTED_SYMBOLS = ["FileIO"];

Components.utils.import("chrome://bound/content/modules/log.jsm");
Components.utils.import("chrome://bound/content/modules/Extension.jsm");

Components.utils.import("resource://gre/modules/FileUtils.jsm");

var FileIO = {
	
	/**
	 * Writes a string to a file
	 * 
	 * @param   {String}    text        Text to write
	 * @param   {nsIFile}   file        File to write to
	 * @param   {int}       modeFlags   flags to use
	 */
	writeTextFile: function writeTextFile(text, file, modeFlags)
	{
		var foStream = this.openFileOutputStream(file, modeFlags);
		
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);  
		converter.init(foStream, "UTF-8", 0, 0);  
		converter.writeString(text);  
		converter.close(); // this closes foStream  	
	},
	
	readTextFile: function readTextFile(file)
	{
		// open an input stream from file  
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].  
					  createInstance(Components.interfaces.nsIFileInputStream);  
		istream.init(file, 0x01, 0444, 0);  
		istream.QueryInterface(Components.interfaces.nsILineInputStream);  
		  
		// read lines into array  
		var line = {}, lines = [], hasmore;
		var str = "";
		do {  
		  hasmore = istream.readLine(line);  
		  str += line.value + ((hasmore == true) ? "\n" : "");   
		} while(hasmore);  
		  
		istream.close();
		
		return str;
	}
	
};

Extension.borrow(FileIO, FileUtils);