var fs = require('fs.extra');

var boundPath = "D:/Data/Projekte/Bound/";
var ClangPath = boundPath + "Dependencies/clang/";
var CPPAnalyzerPath = boundPath + "src/CPPAnalyzer/";

var files = [];
files.push({ src: "../llvm/tools/clang/include",          destinations: [ClangPath + "include"]});
files.push({ src: "../build_msvc/lib/Debug/libclang.lib", destinations: [ClangPath + "lib/libclang.lib"]});
files.push({ src: "../build_msvc/bin/Debug/libclang.dll", destinations: [ClangPath + "shared/libclang.dll", 
																		 CPPAnalyzerPath + "Debug/libclang.dll"]});

process_files(files);

function existsSync(path)
{
	try
	{
		fs.lstatSync(path);
		return true;
	}
	catch (e)
	{
		return false;
	}
}

function addDestination(src, srcStat, dest, actions)
{
	var destStat = null;

	var destExists = existsSync(dest);
	if(destExists)
		destStat = fs.lstatSync(dest);

	if(srcStat.isDirectory())
	{
		if(destExists)
		{
			if(!destStat.isDirectory())
			{
				console.log("ERROR: Destination is file, while src is not: " + dest);
				return;
			}
		}
		
		var files = fs.readdirSync(src);
		for(var i = 0; i < files.length; ++i)
		{
			// TODO: check ending
			addDestination(src + "/" + files[i], fs.lstatSync(src + "/" + files[i]), dest + "/" + files[i], actions);
		}
	}
	else
	{
		if(destExists)
		{
			if(destStat.isDirectory())
				console.log("ERROR: Destination is directory, while src is not: " + dest);
			else if(destStat.mtime.getTime() < srcStat.mtime.getTime())
				actions.push({type: "update", src: src, dest: dest});
		}
		else
		{
			actions.push({type: "create", src: src, dest: dest});
		}
	}
}

function process_files(files)
{
	for(var i = 0; i < files.length; ++i)
	{
		var src = files[i].src;
		var srcStat = null;
		
		if(existsSync(files[i].src))
			srcStat = fs.lstatSync(files[i].src);
		else
		{
			console.log("ERROR: Source file does not exist: " + files[i].src);
			continue;
		}
		
		if(files[i].destinations.length === 0)
		{
			console.log("INFO: No destinations given: " + files[i].src);
			continue;
		}
			
		var actions = [];
					
		for(var j = 0; j < files[i].destinations.length; ++j)
		{
			addDestination(src, srcStat, files[i].destinations[j], actions);
		}
		
		// executing the actions
		for(var k = 0; k < actions.length; ++k)
		{
			switch(actions[k].type)
			{
				case "update":
					console.log("INFO: Updating destination file: " + actions[k].dest); 
					fs.unlinkSync(actions[k].dest);
					fs.copy(actions[k].src, actions[k].dest, function(err){if(err) console.log(err);});
					break;
				case "create":
					console.log("INFO: Creating destination file: " + actions[k].dest);
					
					var folders = actions[k].dest.split(/[\/\\]/gm);
					
					var dirPath = "";
					for(var m = 0; m < folders.length - 1; ++m)
					{
						dirPath += folders[m] + "/";
						if(!existsSync(dirPath))
							fs.mkdirSync(dirPath);
					}
					
					fs.copy(actions[k].src, actions[k].dest, function(err){ if(err) console.log(err); });
					break;
			}		
		}
	}
}