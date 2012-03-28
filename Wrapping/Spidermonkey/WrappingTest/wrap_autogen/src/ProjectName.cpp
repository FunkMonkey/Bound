#include "ProjectName/Classes.hpp"
#include "ProjectName/Builtin.hpp"
#include "ProjectName/Strings.hpp"
#include "ProjectName.hpp"

namespace jswrap { namespace ProjectName { 
	
	JSBool init(JSContext* cx, JSObject* scope)
	{ 
			::jswrap::ProjectName::Classes::init(cx, scope);
		::jswrap::ProjectName::Builtin::init(cx, scope);
		::jswrap::ProjectName::Strings::init(cx, scope);

		return true;
	}
	
} } 

