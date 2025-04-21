import React, { useEffect, useState } from 'react';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/messages/conversations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError(error.message);
      }
    };

    fetchConversations();
  }, []);

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data);
      setSelectedUser(userId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error.message);
    }
  };

  const sendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedUser,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
    }
  };

  return (
    <div className="flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r">
        <h2 className="text-lg font-bold">Conversations</h2>
        {conversations.map((conversation) => (
          <div
            key={conversation.user._id}
            onClick={() => fetchMessages(conversation.user._id)}
            className="p-2 cursor-pointer hover:bg-gray-200"
          >
            <p>{`${conversation.user.firstName} ${conversation.user.lastName}`}</p>
            <p className="text-sm text-gray-500">{conversation.lastMessage.content}</p>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="w-2/3 p-4">
        {selectedUser ? (
          <>
            <div className="h-96 overflow-y-scroll border">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`p-2 ${
                    message.sender === selectedUser ? 'text-left' : 'text-right'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="border p-2 w-full"
              />
              <button onClick={sendMessage} className="bg-blue-500 text-white p-2 mt-2">
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a conversation to view messages</p>
        )}
      </div>
    </div>
  );
}

export default Messages;
