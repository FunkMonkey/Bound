#ifndef __SELFDISPOSINGCXSTRING_HPP__
#define __SELFDISPOSINGCXSTRING_HPP__

class SelfDisposingCXString
{
public:
	SelfDisposingCXString(CXString str)
		: m_cxString(str)
	{}

	~SelfDisposingCXString()
	{
		clang_disposeString(m_cxString);
	}

	const char* c_str() const { return clang_getCString(m_cxString); }
	CXString getCXString() const { return m_cxString; }

protected:
	CXString m_cxString;
};

#endif // __SELFDISPOSINGCXSTRING_HPP__
