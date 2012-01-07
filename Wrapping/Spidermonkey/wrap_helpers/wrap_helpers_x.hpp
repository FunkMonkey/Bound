#ifndef WRAP_HELPERS_X_HPP
#define WRAP_HELPERS_X_HPP

#include <jsapi.h>
#include "exceptions.hpp"

namespace jswrap
{
	static void checkNumberOfArguments_x(int given, int expected)
	{
		if(given != expected)
			throw exception("Wrong number of arguments");
	}
}

#endif // WRAP_HELPERS_X_HPP