const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("chrome://bound/content/modules/log.jsm");
Cu.import("chrome://bound/content/modules/Bound.jsm");
Cu.import("chrome://bound/content/modules/CPPAnalyzer.jsm");

window.addEventListener("close", Bound.quit, false); 


CPPAnalyzer.init();

var json = null;

function testParsing()
{
	json = CPPAnalyzer.parse_header(["supertest", "D:\\Data\\Projekte\\Bound\\src\\CPPAnalyzer\\Test\\test1.cpp"]);
}





