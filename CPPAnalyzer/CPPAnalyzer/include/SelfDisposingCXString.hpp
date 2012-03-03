#ifndef __SELFDISPOSINGCXSTRING_HPP__
#define __SELFDISPOSINGCXSTRING_HPP__

/** Represents a Clang CXString, that disposes itself on destruction
 */
class SelfDisposingCXString
{
public:
	/** Constructor
     */
	SelfDisposingCXString(CXString str)
		: m_cxString(str)
	{}

	/** Destructor
	 *    - disposes the CXString
     */
	~SelfDisposingCXString()
	{
		clang_disposeString(m_cxString);
	}

	/** Returns the string as a c string
	 *
	 * \return  C string representation of CXString
     */
	const char* c_str() const { return clang_getCString(m_cxString); }

	/** Returns the CXString
	 *
	 * \return CXString
     */
	CXString getCXString() const { return m_cxString; }

protected:
	CXString m_cxString;
};

#endif // __SELFDISPOSINGCXSTRING_HPP__
