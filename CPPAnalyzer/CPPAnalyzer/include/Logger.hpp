#ifndef __LOGGER_HPP__
#define __LOGGER_HPP__

#include <string>
#include <vector>

enum MessageType
{
	MESSAGE_INFO,
	MESSAGE_WARNING,
	MESSAGE_ERROR
};

struct Message
{
	Message(MessageType type, const std::string& message)
		: type(type), message(message)
	{

	}

	MessageType type;
	std::string message;
};

class Logger
{
public:

	void addInfo(const std::string& message)
	{
		m_messages.push_back(Message(MESSAGE_INFO, message));
	}

	void addWarning(const std::string& message)
	{
		m_messages.push_back(Message(MESSAGE_WARNING, message));
	}

	void addError(const std::string& message)
	{
		m_messages.push_back(Message(MESSAGE_ERROR, message));
	}

	const std::vector<Message>& getMessages() const { return m_messages; }

protected:
	std::vector<Message> m_messages;
	
};

#endif // __LOGGER_HPP__
