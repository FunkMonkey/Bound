#ifndef WRAP_HELPERS_X_HPP
#define WRAP_HELPERS_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"

namespace jswrap
{
	/** 
	 * Checks the number of arguments and throws exception if wrong
	 *
	 * \param 	given     Given number of arguments
	 * \param 	expected  Expected number of arguments
	 */
	static void checkNumberOfArguments_x(int given, int expected)
	{
		if(given != expected)
			throw exception("Wrong number of arguments");
	}

	/** 
	 * Checks the minimum number of arguments and throws exception if less
	 *
	 * \param 	given     Given number of arguments
	 * \param 	expected  Expected number of arguments
	 */
	static void checkMinNumberOfArguments_x(int given, int expected)
	{
		if(given < expected)
			throw exception("Wrong number of arguments");
	}

}

#endif // WRAP_HELPERS_X_HPP