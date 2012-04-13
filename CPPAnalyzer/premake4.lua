-- The complete solution
solution "CPPAnalyzer"
	location "build"
	configurations { "Debug", "Release" }

	-- CPPAnalyzer shared library
	project "CPPAnalyzer"
		kind "SharedLib"
		language "C++"
		files { "./CPPAnalyzer/include/**.hpp", "./CPPAnalyzer/include/**.h" , "./CPPAnalyzer/src/**.cpp" }
		defines { "LIBRARY_EXPORTS", "JSON_IS_AMALGAMATION" }
		
		includedirs { "./CPPAnalyzer/include" }
		includedirs { "../../Dependencies/clang/include" }
		libdirs { "../../Dependencies/clang/lib" }
		
		links { "libclang" }
		
		-- Configurations
		configuration "Debug"
			defines { "DEBUG" }
			flags { "Symbols" }
			targetdir "build/CPPAnalyzer/bin/debug"
			objdir "build/CPPAnalyzer/obj/debug"

		configuration "Release"
			defines { "NDEBUG" }
			flags { "Optimize" }
			targetdir "build/CPPAnalyzer/bin/release"
			objdir "build/CPPAnalyzer/obj/release"