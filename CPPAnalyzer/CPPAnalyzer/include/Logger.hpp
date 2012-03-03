#ifndef __LOGGER_HPP__
#define __LOGGER_HPP__

#include <string>
#include <vector>

/** Represents a message type of a logger message
 */
enum MessageType
{
	MESSAGE_INFO,
	MESSAGE_WARNING,
	MESSAGE_ERROR
};

/** Represents a message of a logger
 */
struct Message
{
	Message(MessageType type, const std::string& message)
		: type(type), message(message)
	{

	}

	MessageType type;
	std::string message;
};

/** Represents a message logger
 */
class Logger
{
public:

	/** Appends an info log message using the given string
	 *
	 * \param   message   Message to append
     */
	void addInfo(const std::string& message)
	{
		m_messages.push_back(Message(MESSAGE_INFO, message));
	}

	/** Appends a warning log message using the given string
	 *
	 * \param   message   Message to append
     */
	void addWarning(const std::string& message)
	{
		m_messages.push_back(Message(MESSAGE_WARNING, message));
	}

	/** Appends an error log message using the given string
	 *
	 * \param   message   Message to append
     */
	void addError(const std::string& message)
	{
		m_messages.push_back(Message(MESSAGE_ERROR, message));
	}

	/** Returns all the messages that have been logged
	 *
	 * \return   Messages of the logger
     */
	const std::vector<Message>& getMessages() const { return m_messages; }

protected:
	std::vector<Message> m_messages;
	
};

#endif // __LOGGER_HPP__
