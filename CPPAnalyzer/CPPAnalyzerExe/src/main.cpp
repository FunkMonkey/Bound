#include <iostream>

#include "Clang_JSON_lib.hpp"


int main(int argc, char *argv[]) {

	parse_header(argc, argv, ".*", ".*", 8);

	int foo;
	//std::cin >> foo;

	return 0;
}
