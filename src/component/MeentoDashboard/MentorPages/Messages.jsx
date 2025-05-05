import React, { useEffect, useState } from 'react';

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Decode token or get userId from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId || payload.id || payload._id);
      } catch (e) {
        console.error('Invalid token format', e);
      }
    }

    const fetchConversations = async () => {
      try {
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
    if (!selectedUser || !newMessage.trim()) return;

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
    <div className="flex h-full">
      {/* Conversations List */}
      <div className="w-1/3 border-r overflow-y-auto h-screen p-4">
        <h2 className="text-lg font-bold mb-2">Conversations</h2>
        {conversations.length === 0 && <p>No conversations yet.</p>}
        {conversations.map((conversation, index) => {
          const user = conversation.user || {};
          const lastMessage = conversation.lastMessage || {};

          return (
            <div
              key={user._id || index}
              onClick={() => user._id && fetchMessages(user._id)}
              className="p-2 cursor-pointer hover:bg-gray-200 border-b"
            >
              <p className="font-medium">{`${user.firstName || 'Unknown'} ${user.lastName || ''}`}</p>
              <p className="text-sm text-gray-500 truncate">{lastMessage.content || 'No messages yet'}</p>
            </div>
          );
        })}
      </div>

      {/* Messages */}
      <div className="w-2/3 p-4 flex flex-col h-screen">
        {selectedUser ? (
          <>
            <div className="flex-1 overflow-y-scroll border p-2 mb-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`p-2 my-1 max-w-xs ${
                    message.sender === currentUserId ? 'ml-auto bg-blue-100 text-right' : 'mr-auto bg-gray-100 text-left'
                  } rounded`}
                >
                  <p>{message.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="border p-2 w-full rounded"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a conversation to view messages</p>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}

export default Messages;
