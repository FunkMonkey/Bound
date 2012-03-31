#include "ProjectName/Classes.hpp"
#include "ProjectName/Builtin.hpp"
#include "ProjectName/Strings.hpp"
#include "ProjectName/Inheritance.hpp"
#include "ProjectName/UsingAndOwnership.hpp"
#include "ProjectName.hpp"

namespace jswrap { namespace ProjectName { 
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
			::jswrap::ProjectName::Classes::init(cx, scope);
		::jswrap::ProjectName::Builtin::init(cx, scope);
		::jswrap::ProjectName::Strings::init(cx, scope);
		::jswrap::ProjectName::Inheritance::init(cx, scope);
		::jswrap::ProjectName::UsingAndOwnership::init(cx, scope);

		return true;
	}
	
} } 

